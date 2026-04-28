import { ethers, constants } from "ethers";
import { getMarketPrice, getTokenPrice, sleep, trim } from "../../helpers";
import { calculateUserBondDetails, getBalances } from "./account-slice";
import { getAddresses } from "../../constants";
import { fetchPendingTxns, clearPendingTxn } from "./pending-txns-slice";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { fetchAccountSuccess } from "./account-slice";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { getBondCalculator } from "../../helpers/bond-calculator";
import { RootState } from "../store";
import { avaxTime, wmemoMim } from "../../helpers/bond";
import { error, warning, success, info } from "../slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { BigNumber } from "ethers";
import { CustomTreasuryContract, wMemoTokenContract, StakingContract } from "../../abi";

interface IChangeApproval {
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeApproval = createAsyncThunk("bonding/changeApproval", async ({ bond, provider, networkID, address }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserve(networkID, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);
        const bondAddr = bond.getAddressForBond(networkID);
        approveTx = await reserveContract.approve(bondAddr, constants.MaxUint256, { gasPrice });
        dispatch(
            fetchPendingTxns({
                txnHash: approveTx.hash,
                text: "Approving " + bond.displayName,
                type: "approve_" + bond.name,
            }),
        );
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    let allowance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));

    return dispatch(
        fetchAccountSuccess({
            bonds: {
                [bond.name]: {
                    allowance: Number(allowance),
                },
            },
        }),
    );
});

interface ICalcBondDetails {
    bond: Bond;
    value: string | null;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IBondDetails {
    bond: string;
    bondDiscount: number;
    bondQuote: number;
    bondQuoteWrapped?: number;
    purchased: number;
    vestingTerm: number;
    maxBondPrice: number;
    maxBondPriceWrapped?: number;
    bondPrice: number;
    marketPrice: number;
    maxBondPriceToken: number;
    soldOut?: boolean;
}

export const calcBondDetails = createAsyncThunk("bonding/calcBondDetails", async ({ bond, value, provider, networkID }: ICalcBondDetails, { dispatch, getState }) => {
    if (!value) {
        value = "0";
    }

    const amountInWei = ethers.utils.parseEther(value);

    let bondPrice = 0,
        bondDiscount = 0,
        valuation = 0,
        bondQuote = 0,
        bondQuoteWrapped = 0;

    const addresses = getAddresses(networkID);
    const mimPrice = getTokenPrice("MIM");

    const bondContract = bond.getContractForBond(networkID, provider);
    const bondCalcContract = getBondCalculator(networkID, provider);
    const wMemoContract = new ethers.Contract(addresses.WMEMO_ADDRESS, wMemoTokenContract, provider);

    const terms = await bondContract.terms();
    const maxBondPriceRaw = await bondContract.maxPayout();
    // TIME uses 9 decimals — use formatUnits to safely convert BigNumber
    let maxBondPrice = Number(ethers.utils.formatUnits(maxBondPriceRaw, "gwei"));
    const maxBondPriceWrapped = (await wMemoContract.MEMOTowMEMO(maxBondPriceRaw)) / Math.pow(10, 18);

    // --- Market price resolution ---
    // On testnet: no Coingecko data exists for TIME, so read from app Redux state
    // (populated by loadAppDetails which queries the staking contract index).
    // Fall back to on-chain staking index if app state hasn't loaded yet.
    // On mainnet: use the existing API helper.
    let marketPrice: number; // TIME price in USD
    let wMemoPrice: number;  // wMEMO price in USD

    if (networkID === Networks.PULSE_TESTNET) {
        const appState = (getState() as RootState).app as any;
        marketPrice = Number(appState.marketPrice) || 0;
        wMemoPrice = Number(appState.wMemoMarketPrice) || 0;

        // Fallback: derive directly from staking contract if app state not loaded yet
        if (!marketPrice || !wMemoPrice) {
            const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
            const currentIndex = await stakingContract.index();
            const indexNum = Number(ethers.utils.formatUnits(currentIndex, "gwei"));
            // TIME launch price on testnet is $1; wMEMO = index * TIME price
            marketPrice = marketPrice || 1;
            wMemoPrice = wMemoPrice || (indexNum * (marketPrice || 1));
        }
    } else {
        const prices = await getMarketPrice();
        marketPrice = prices.timePrice * mimPrice;
        wMemoPrice = prices.wMemoPrice;
    }

    // --- Bond price from contract ---
    //
    // BondDepository (non-LP, e.g. USDC):
    //   bondPriceInUSD() = bondPrice() × 10^reserveDecimals / 100
    //   e.g. minimumPrice=100, USDC 6 dec: 100 × 1e6 / 100 = 1e6 → formatUnits(1e6, 6) = $1
    //   Display: formatUnits(raw, reserveDecimals)
    //
    // EthBondDepository (non-LP, e.g. WPLS):
    //   bondPriceInUSD() = bondPrice() × assetPrice(oracle, 8 dec) × 1e6
    //   USD per TIME = (bondPrice/100) × (assetPrice/1e8) = raw / 1e16
    //   Display: raw / 1e16
    //
    // BondDepository (LP, e.g. TIME-USDC LP):
    //   bondPriceInUSD() = bondPrice() × markdown(LP) / 100
    //   markdown = nonTIME_reserve × 2 × 1e9 / getTotalValue
    //   For stablecoin LP (USDC 6 dec, $1 price): result / 1e7 = USD price ✓
    //   For WPLS LP: markdown is astronomically large (formula assumes stablecoin).
    //                TIME-WPLS LP is disabled (deprecated: true) until a custom
    //                oracle-aware BondingCalculator is available.
    try {
        const bondPriceRaw = await bondContract.bondPriceInUSD();
        if (bond.isLP) {
            // LP price formula: bondPriceInUSD = bondPrice() × markdown / 100
            // markdown = quoteReserve × 2 × 1e9 / getTotalValue
            // For stablecoin quote (USDC 6 dec): markdown ≈ 1e6 at 1:1 → raw ≈ 1e7 → / 1e7 = $1
            // For 18-dec stablecoin (MIM): markdown ≈ 1e18 at 1:1 → raw ≈ 1e19 → / 1e19 = $1
            // The divisor is 10^(quoteTokenDecimals + 1), hardcoded to 1e7 for USDC LP.
            bondPrice = Number(bondPriceRaw) / Math.pow(10, 7);
        } else if (bond.isEthBond) {
            // EthBondDepository: USD = raw / 1e16
            bondPrice = Number(bondPriceRaw) / 1e16;
        } else {
            // BondDepository: USD = formatUnits(raw, reserveDecimals)
            bondPrice = Number(ethers.utils.formatUnits(bondPriceRaw, bond.reserveDecimals));
        }

        if (bond.name === avaxTime.name) {
            bondPrice = bondPrice * getTokenPrice("AVAX");
        }

        bondDiscount = bondPrice > 0 ? (marketPrice - bondPrice) / bondPrice : 0;
    } catch (e) {
        console.log("error getting bondPriceInUSD", e);
    }

    let maxBondPriceToken = 0;
    const maxBodValue = ethers.utils.parseEther("1");

    if (bond.isLP) {
        if (!bond.deprecated) {
            valuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), amountInWei);
            bondQuote = await bondContract.payoutFor(valuation);
            bondQuoteWrapped = (await wMemoContract.MEMOTowMEMO(bondQuote)) / Math.pow(10, 18);
            bondQuote = bondQuote / Math.pow(10, 9);

            const maxValuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), maxBodValue);
            const maxBondQuote = await bondContract.payoutFor(maxValuation);
            maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -9));
        }
    } else {
        if (!bond.deprecated) {
            // For non-LP bonds, payoutFor() expects treasury-normalized units.
            // treasury.valueOf(anyToken, 1 whole token) always returns 1e9 TIME-gwei,
            // because the treasury normalises by (tokenDecimals → TIME decimals = 9).
            // So for N user tokens the correct input is N * 1e9 = parseUnits(value, 9).
            const amountForPayout = ethers.utils.parseUnits(value, 9); // value × 1e9
            try {
                bondQuote = await bondContract.payoutFor(amountForPayout);
                if (bondQuote > 0) {
                    bondQuoteWrapped = (await wMemoContract.MEMOTowMEMO(parseInt(trim(bondQuote / Math.pow(10, 9), 0)))) / Math.pow(10, 18);
                }
                bondQuote = bondQuote / Math.pow(10, 9);
            } catch (e) {
                console.log("payoutFor quote error (non-LP)", e);
                bondQuote = 0;
            }

            // Reference: 1 whole token = 1e9 treasury units
            const oneTokenNorm = ethers.BigNumber.from(10).pow(9);
            try {
                const maxBondQuote = await bondContract.payoutFor(oneTokenNorm);
                // maxBondQuote is TIME-gwei payout for 1 whole token
                // maxBondPriceToken = how many whole tokens to reach maxBondPrice TIME
                maxBondPriceToken = maxBondPrice / Number(ethers.utils.formatUnits(maxBondQuote, 9));
            } catch (e) {
                console.log("payoutFor maxBondQuote error (non-LP)", e);
                maxBondPriceToken = bondPrice > 0 ? maxBondPrice * bondPrice : 0;
            }
        }
    }

    if (!!value && bondQuote > maxBondPrice && !bond.deprecated) {
        dispatch(error({ text: messages.try_mint_more(maxBondPrice.toFixed(2).toString()) }));
    }

    

    // Treasury balance of the reserve token (how much has been bonded/purchased)
    const token = bond.getContractForReserve(networkID, provider);
    let purchased = await token.balanceOf(addresses.TREASURY_ADDRESS);

    if (bond.tokensInStrategy) {
        purchased = BigNumber.from(purchased).add(BigNumber.from(bond.tokensInStrategy)).toString();
    }

    

    if (bond.isLP) {
        const assetAddress = bond.getAddressForReserve(networkID);
        const markdown = await bondCalcContract.markdown(assetAddress);
        purchased = await bondCalcContract.valuation(assetAddress, purchased);
        purchased = (markdown / Math.pow(10, 18)) * (purchased / Math.pow(10, 9));

        if (bond.customToken) {
            purchased = purchased * getTokenPrice(bond.bondToken);
        }

        if (bond.name === wmemoMim.name) {
            purchased = purchased * wMemoPrice * mimPrice;
        }
    } else {
        // Use actual reserve decimals — USDC=6, MIM/WPLS=18
        purchased = Number(ethers.utils.formatUnits(purchased, bond.reserveDecimals));

        if (bond.customToken) {
            purchased = purchased * getTokenPrice(bond.bondToken);
        }
    }

    

    return {
        bond: bond.name,
        bondDiscount,
        bondQuote,
        purchased,
        vestingTerm: Number(terms.vestingTerm),
        maxBondPrice,
        bondPrice,           // USD price per TIME (already formatted)
        marketPrice: wMemoPrice, // wMEMO price shown in Bond header
        maxBondPriceToken,
        bondQuoteWrapped,
        maxBondPriceWrapped,
    };
});

async function calcPayoutFor(value: string, customTreasury: ethers.Contract, bondContract: ethers.Contract) {
    const token = await bondContract.principalToken();
    const tokensValue = await customTreasury.valueOfToken(token, value);
    const payoutFor = await bondContract.payoutFor(tokensValue);
    return payoutFor / Math.pow(10, 18);
}

export const calcBondV2Details = createAsyncThunk("bonding/calcBondV2Details", async ({ bond, value, provider, networkID }: ICalcBondDetails, { dispatch }) => {
    if (!value) {
        value = "0";
    }
    const amountInWei = ethers.utils.parseEther(value);

    let bondPrice = 0,
        bondDiscount = 0,
        bondQuote = 0,
        maxBondPriceToken = 0;

    const addresses = getAddresses(networkID);

    const bondContract = bond.getContractForBond(networkID, provider);
    const customTreasury = new ethers.Contract(addresses.TREASURY_ADDRESS, CustomTreasuryContract, provider);

    const terms = await bondContract.terms();
    let maxBondPrice = (await bondContract.maxPayout()) / Math.pow(10, 18);

    const wmemoContract = new ethers.Contract(addresses.WMEMO_ADDRESS, wMemoTokenContract, provider);
    const treasutyBalance = (await wmemoContract.balanceOf(addresses.TREASURY_ADDRESS)) / Math.pow(10, 18);

    maxBondPrice = treasutyBalance > maxBondPrice ? maxBondPrice : treasutyBalance;

    let { wMemoPrice } = await getMarketPrice();

    const mimPrice = getTokenPrice("MIM");

    const maxBodValue = ethers.utils.parseEther("1");
    const bondValue = ethers.utils.parseEther("1000");

    try {
        if (!bond.deprecated) {
            bondQuote = await calcPayoutFor(amountInWei.toString(), customTreasury, bondContract);

            const payoutForMax = await calcPayoutFor(maxBodValue.toString(), customTreasury, bondContract);
            maxBondPriceToken = maxBondPrice / payoutForMax;
        }

        bondPrice = (await bondContract.bondPrice()) / Math.pow(10, 7);
        const stablePayoutFor = await calcPayoutFor(bondValue.toString(), customTreasury, bondContract);
        const payoutForUsd = stablePayoutFor * wMemoPrice;
        bondDiscount = (payoutForUsd - 1000) / 1000;
    } catch (e) {
        console.log("error getting bondPriceInUSD", e);
    }

    let purchased = await bondContract.totalPrincipalBonded();
    purchased = Number(ethers.utils.formatEther(purchased)) * mimPrice;

    const soldOut = treasutyBalance < 0.00001;

    return {
        bond: bond.name,
        bondDiscount,
        bondPrice,
        purchased,
        bondQuote,
        vestingTerm: Number(terms.vestingTerm),
        maxBondPrice,
        marketPrice: wMemoPrice,
        maxBondPriceToken,
        soldOut,
    };
});

interface IBondAsset {
    value: string;
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    slippage: number;
    useAvax: boolean;
}
export const bondAsset = createAsyncThunk("bonding/bondAsset", async ({ value, address, bond, networkID, provider, slippage, useAvax }: IBondAsset, { dispatch }) => {
    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005;
    // Use the reserve token's actual decimals so USDC (6) deposits the right amount
    const valueInWei = ethers.utils.parseUnits(value, bond.reserveDecimals);
    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    const calculatePremium = await bondContract.bondPrice();
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    let bondTx;
    try {
        const gasPrice = await getGasPrice(provider);

        if (useAvax) {
            bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress, { value: valueInWei, gasPrice });
        } else {
            bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress, { gasPrice });
        }
        dispatch(
            fetchPendingTxns({
                txnHash: bondTx.hash,
                text: "Bonding " + bond.displayName,
                type: "bond_" + bond.name,
            }),
        );
        await bondTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (bondTx) {
            dispatch(clearPendingTxn(bondTx.hash));
        }
    }
});

interface IRedeemBond {
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    autostake: boolean;
}

export const redeemBond = createAsyncThunk("bonding/redeemBond", async ({ address, bond, networkID, provider, autostake }: IRedeemBond, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    let redeemTx;
    try {
        const gasPrice = await getGasPrice(provider);

        if (bond.v2Bond) {
            redeemTx = await bondContract.redeem(address, { gasPrice });
        } else {
            redeemTx = await bondContract.redeem(address, autostake === true, { gasPrice });
        }

        const pendingTxnType = "redeem_bond_" + bond.name + (autostake === true ? "_autostake" : "");
        dispatch(
            fetchPendingTxns({
                txnHash: redeemTx.hash,
                text: "Redeeming " + bond.displayName,
                type: pendingTxnType,
            }),
        );
        await redeemTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
        await sleep(0.01);
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        await dispatch(getBalances({ address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        metamaskErrorWrap(err, dispatch);
    } finally {
        if (redeemTx) {
            dispatch(clearPendingTxn(redeemTx.hash));
        }
    }
});

export interface IBondSlice {
    loading: boolean;
    [key: string]: any;
}

const initialState: IBondSlice = {
    loading: true,
};

const setBondState = (state: IBondSlice, payload: any) => {
    const bond = payload.bond;
    const newState = { ...state[bond], ...payload };
    state[bond] = newState;
    state.loading = false;
};

const bondingSlice = createSlice({
    name: "bonding",
    initialState,
    reducers: {
        fetchBondSuccess(state, action) {
            state[action.payload.bond] = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(calcBondDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calcBondDetails.fulfilled, (state, action) => {
                setBondState(state, action.payload);
                state.loading = false;
            })
            .addCase(calcBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calcBondV2Details.pending, state => {
                state.loading = true;
            })
            .addCase(calcBondV2Details.fulfilled, (state, action) => {
                setBondState(state, action.payload);
                state.loading = false;
            })
            .addCase(calcBondV2Details.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);

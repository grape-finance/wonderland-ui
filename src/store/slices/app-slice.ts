import { ethers } from "ethers";
import { getAddresses, WONDERLAND_API } from "../../constants";
import { StakingContract, MemoExchangeAbi, MemoTokenContract, TreasuryContract } from "../../abi";
import { setAll } from "../../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getMarketPrice, getTokenPrice } from "../../helpers";
import { RootState } from "../store";
import { Networks } from "../../constants/blockchain";
import { error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getFundTotal } from "../../helpers/get-fund-total";
import { IData } from "src/hooks/types";
import axios from "axios";

interface ILoadAppDetails {
    networkID: number;
    provider: JsonRpcProvider;
    checkWrongNetwork: () => Promise<boolean>;
}

export const loadAppDetails = createAsyncThunk("app/loadAppDetails", async ({ networkID, provider, checkWrongNetwork }: ILoadAppDetails, { dispatch }): Promise<any> => {
    try {
        await provider.getBlockNumber();
    } catch (err) {
        console.log(err);
        dispatch(error({ text: messages.rpc_connection_lost }));
        checkWrongNetwork();
    }

    const currentBlock = await provider.getBlockNumber();
    const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;

    // Testnet: read all metrics directly from on-chain contracts to avoid
    // dependence on the external Wonderland API (which tracks mainnet only).
    if (networkID === Networks.PULSE_TESTNET) {
        const addresses = getAddresses(networkID);

        const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
        const memoContract = new ethers.Contract(addresses.MEMO_ADDRESS, MemoTokenContract, provider);
        const treasuryContract = new ethers.Contract(addresses.TREASURY_ADDRESS, TreasuryContract, provider);

        const [epoch, circ, currentIndex, totalReserves, totalSupply] = await Promise.all([
            stakingContract.epoch(),
            memoContract.circulatingSupply(),
            stakingContract.index(),
            treasuryContract.totalReserves(),
            memoContract.totalSupply(),
        ]);

        const stakingReward = epoch.distribute;
        // Both distribute and circ are 9-decimal (gwei) values
        const stakingRebase = circ.gt(0) ? stakingReward.mul(1e9).div(circ).toNumber() / 1e9 : 0;
        const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
        const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;

        // TIME launched at $10; wMEMO price grows proportionally to index
        const timePrice = 10;
        const indexFormatted = Number(ethers.utils.formatUnits(currentIndex, "gwei"));
        const wMemoMarketPrice = indexFormatted * timePrice;

        const circFormatted = Number(ethers.utils.formatUnits(circ, "gwei"));
        const supplyFormatted = Number(ethers.utils.formatUnits(totalSupply, "gwei"));
        // Treasury stores reserves as 9-decimal TIME-equivalent value
        const treasuryBalance = Number(ethers.utils.formatUnits(totalReserves, 9));

        return {
            currentIndex: indexFormatted,
            currentBlock,
            currentBlockTime,
            fiveDayRate,
            treasuryBalance,
            stakingAPY,
            stakingTVL: circFormatted * timePrice,
            stakingRebase,
            nextRebase: epoch.endTime,
            marketPrice: timePrice,
            wMemoMarketPrice,
            marketCap: supplyFormatted * timePrice,
            rfvWmemo: 0,
        };
    }

    // Mainnet: use external Wonderland API + on-chain reads as before.
    const { wMemoPrice } = await getMarketPrice();
    const { total, zapper } = await getFundTotal();
    const { wmemo } = await (await axios.get(WONDERLAND_API)).data;

    const rfvWmemo = total / Number(ethers.utils.formatEther(wmemo.circulation));
    const marketCap = Number(ethers.utils.formatEther(wmemo.totalSupply)) * wMemoPrice;
    const stakingTVL = Number(ethers.utils.formatEther(wmemo.circulation)) * wMemoPrice;

    if (networkID !== Networks.PULSE) {
        return { wMemoMarketPrice: wMemoPrice, treasuryBalance: total, currentBlock, currentBlockTime, zapper, marketCap, stakingTVL, rfvWmemo };
    }

    const addresses = getAddresses(networkID);
    const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
    const memoContract = new ethers.Contract(addresses.MEMO_ADDRESS, MemoTokenContract, provider);

    const epoch = await stakingContract.epoch();
    const stakingReward = epoch.distribute;
    const circ = await memoContract.circulatingSupply();
    const stakingRebase = stakingReward / circ;
    const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
    const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;

    const currentIndex = await stakingContract.index();
    const nextRebase = epoch.endTime;

    const redemptionContract = new ethers.Contract(addresses.REDEMPTION_ADDRESS, MemoExchangeAbi, provider);
    const redemptionRateUsdc = await redemptionContract.USDC_EXCHANGERATE();
    const redemptionRateBsgg = await redemptionContract.BSGG_EXCHANGERATE();
    const redemptionDeadline = await redemptionContract.deadline();

    return {
        currentIndex: Number(ethers.utils.formatUnits(currentIndex, "gwei")) / 4.5,
        marketCap,
        currentBlock,
        fiveDayRate,
        treasuryBalance: total,
        stakingAPY,
        stakingTVL,
        stakingRebase,
        currentBlockTime,
        nextRebase,
        wMemoMarketPrice: wMemoPrice,
        rfvWmemo,
        redemptionRateUsdc,
        redemptionRateBsgg,
        redemptionDeadline,
        zapper,
    };
});

const initialState = {
    loading: true,
};

export interface IZapperData {
    wallet: IData[];
    vaults: IData[];
    leveragedPosition: IData[];
    liquidityPool: IData[];
    claimable: IData[];
    debt: IData[];
    farm: IData[];
}

export interface IAppSlice {
    loading: boolean;
    stakingTVL: number;
    marketPrice: number;
    wMemoMarketPrice: number;
    marketCap: number;
    circSupply: number;
    currentIndex: string;
    currentBlock: number;
    currentBlockTime: number;
    fiveDayRate: number;
    treasuryBalance: number;
    stakingAPY: number;
    stakingRebase: number;
    nextRebase: number;
    totalSupply: number;
    rfvWmemo: number;
    redemptionRateUsdc: number;
    redemptionRateBsgg: number;
    redemptionDeadline: number;
    zapper: IZapperData;
}

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        fetchAppSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAppDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(loadAppDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAppDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);

import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { StakingContract, StakingDistributorContract, MemoExchangeAbi, MemoTokenContract, wMemoTokenContract } from "../../abi";
import { setAll } from "../../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getMarketPrice } from "../../helpers";
import { RootState } from "../store";
import { Networks } from "../../constants/blockchain";
import { error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getFundTotal } from "../../helpers/get-fund-total";
import { IData } from "src/hooks/types";

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

    const { timePrice, wMemoPrice } = await getMarketPrice(networkID, provider);
    const currentBlock = await provider.getBlockNumber();
    const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;

    const { total, zapper } = await getFundTotal(networkID, provider);
    const addresses = getAddresses(networkID);

    // wMEMO supply from on-chain.
    // wMEMO is only minted when a user explicitly wraps MEMO:
    //   TIME → stake → MEMO → wrap → wMEMO
    // When no one has wrapped yet (totalSupply = 0) Market Cap, TVL and Backing
    // per wMEMO would all show $0.  Fall back to the MEMO-equivalent wMEMO amount:
    //   equivalent wMEMO = MEMO.circulatingSupply / stakingIndex
    // This is algebraically identical to wMEMO × wMemoPrice once wrapping begins.
    const wMemoContract = new ethers.Contract(addresses.WRAPPED_QUASAR_ADDRESS, wMemoTokenContract, provider);
    const wMemoSupplyRaw = await wMemoContract.totalSupply();
    let effectiveWMemoCirc = Number(ethers.utils.formatEther(wMemoSupplyRaw));

    if (effectiveWMemoCirc === 0) {
        const memoContract = new ethers.Contract(addresses.QUASAR_ADDRESS, MemoTokenContract, provider);
        const stakingContractForIndex = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
        const [memoCircRaw, currentIndexRaw] = await Promise.all([
            memoContract.circulatingSupply(),
            stakingContractForIndex.index(),
        ]);
        const memoCirc = Number(ethers.utils.formatUnits(memoCircRaw, 9));
        const index = Number(ethers.utils.formatUnits(currentIndexRaw, "gwei"));
        effectiveWMemoCirc = index > 0 ? memoCirc / index : 0;
    }

    const rfvWmemo = effectiveWMemoCirc > 0 ? total / effectiveWMemoCirc : 0;
    const marketCap = effectiveWMemoCirc * wMemoPrice;
    const stakingTVL = effectiveWMemoCirc * wMemoPrice;

    
    // if (networkID !== Networks.PULSE) {
    //     return { wMemoMarketPrice: wMemoPrice, treasuryBalance: total, currentBlock, currentBlockTime, zapper, marketCap, stakingTVL, rfvWmemo };
    // }
    const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
    const memoContract = new ethers.Contract(addresses.QUASAR_ADDRESS, MemoTokenContract, provider);

    const epoch = await stakingContract.epoch();
    const distributorContract = new ethers.Contract(addresses.DISTRIBUTOR_ADDRESS, StakingDistributorContract, provider);
    const scheduledRewardRaw = await distributorContract.nextRewardFor(addresses.STAKING_ADDRESS);

    // `epoch.distribute` is zero until the first rebase stages a reward for the
    // following epoch. During that bootstrap window, use Distributor's live
    // scheduled reward so the UI reports the protocol's projected yield rather
    // than a misleading 0%.
    const projectedRewardRaw = epoch.distribute.gt(0) ? epoch.distribute : scheduledRewardRaw;
    const stakingReward = Number(ethers.utils.formatUnits(projectedRewardRaw, 9));
    const circ = Number(ethers.utils.formatUnits(await memoContract.circulatingSupply(), 9));
    const stakingRebase = circ > 0 ? stakingReward / circ : 0;
    const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
    const uncappedStakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;
    const stakingAPYCapped = !Number.isFinite(uncappedStakingAPY) || uncappedStakingAPY > 10000000;
    const stakingAPY = stakingAPYCapped ? 10000000 : uncappedStakingAPY;
    
    const currentIndex = await stakingContract.index();
    const nextRebase = epoch.endTime;
    
    // const redemptionContract = new ethers.Contract(addresses.REDEMPTION_ADDRESS, MemoExchangeAbi, provider);
    // const redemptionRateUsdc = await redemptionContract.USDC_EXCHANGERATE();
    // console.log('redemptionRateUsdc', redemptionRateUsdc)
    // const redemptionRateBsgg = await redemptionContract.BSGG_EXCHANGERATE();
    // const redemptionDeadline = await redemptionContract.deadline();

    // console.log('redemptionDeadline', redemptionDeadline)

    return {
        currentIndex: Number(ethers.utils.formatUnits(currentIndex, "gwei")),
        marketPrice: timePrice,
        marketCap,
        currentBlock,
        fiveDayRate,
        treasuryBalance: total,
        stakingAPY,
        stakingAPYCapped,
        stakingTVL,
        stakingRebase,
        currentBlockTime,
        nextRebase,
        wMemoMarketPrice: wMemoPrice,
        rfvWmemo,
        redemptionRateUsdc : 0,
        redemptionRateBsgg : 0,
        redemptionDeadline : 0,
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
    stakingAPYCapped: boolean;
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

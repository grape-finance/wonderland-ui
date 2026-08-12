import { ethers } from "ethers";
import { StaticJsonRpcProvider, JsonRpcProvider } from "@ethersproject/providers";
import { getAddresses } from "../constants/addresses";
import { LpReserveContract, StakingContract } from "../abi";
import { getProtocolAssetPrices } from "./aave-oracle-price";

/**
 * Derive protocol-token prices from live market data.
 *
 * PULSAR/USD is derived from the primary PULSAR/pDAI pool and live pDAI/USD.
 * Legacy USDC and WPLS pools remain read-only fallbacks for old deployments.
 * Wrapped QUASAR is PULSAR/USD multiplied by the staking index because one
 * wrapped token unwraps to `index` rebasing tokens.
 *
 * There is deliberately no $1 fallback: a missing price should be visible as
 * unavailable instead of making every downstream metric look plausible.
 */
export async function getMarketPrice(networkID: number, provider: StaticJsonRpcProvider | JsonRpcProvider) {
    const addresses = getAddresses(networkID);
    const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
    const currentIndex = await stakingContract.index();
    const indexFormatted = Number(ethers.utils.formatUnits(currentIndex, "gwei"));

    let timePrice = 0;
    const assetPrices = await getProtocolAssetPrices(networkID, provider);

    if (addresses.LP_PAIR_PULSARPDAI) {
        try {
            const lpPair = new ethers.Contract(addresses.LP_PAIR_PULSARPDAI, LpReserveContract, provider);
            const [[r0, r1], token0] = await Promise.all([lpPair.getReserves(), lpPair.token0()]);
            const isPulsarToken0 = token0.toLowerCase() === addresses.PULSAR_ADDRESS.toLowerCase();
            const pulsarReserve = isPulsarToken0 ? r0 : r1;
            const pdaiReserve = isPulsarToken0 ? r1 : r0;
            const pdaiPerPulsar = Number(ethers.utils.formatEther(pdaiReserve)) /
                Number(ethers.utils.formatUnits(pulsarReserve, 9));
            const dexPrice = pdaiPerPulsar * assetPrices.PDAI;
            if (dexPrice > 0 && Number.isFinite(dexPrice)) timePrice = dexPrice;
        } catch (error) {
            console.warn("Unable to read the primary PULSAR/pDAI market", error);
        }
    }

    if (timePrice === 0 && addresses.LP_PAIR_TIMEUSDC) {
        try {
            const lpPair = new ethers.Contract(addresses.LP_PAIR_TIMEUSDC, LpReserveContract, provider);
            const [[r0, r1], token0] = await Promise.all([lpPair.getReserves(), lpPair.token0()]);
            const isPulsarToken0 = token0.toLowerCase() === addresses.PULSAR_ADDRESS.toLowerCase();
            const pulsarReserve = isPulsarToken0 ? r0 : r1;
            const stableReserve = isPulsarToken0 ? r1 : r0;
            const dexPrice = Number(ethers.utils.formatUnits(stableReserve, 6)) / Number(ethers.utils.formatUnits(pulsarReserve, 9));
            if (dexPrice > 0 && Number.isFinite(dexPrice)) timePrice = dexPrice;
        } catch (error) {
            console.warn("Unable to read the PULSAR/stable market", error);
        }
    }

    if (timePrice === 0 && addresses.LP_PAIR_TIMEWPLS) {
        try {
            const lpPair = new ethers.Contract(addresses.LP_PAIR_TIMEWPLS, LpReserveContract, provider);
            const [[r0, r1], token0] = await Promise.all([lpPair.getReserves(), lpPair.token0()]);
            const isPulsarToken0 = token0.toLowerCase() === addresses.PULSAR_ADDRESS.toLowerCase();
            const pulsarReserve = isPulsarToken0 ? r0 : r1;
            const wplsReserve = isPulsarToken0 ? r1 : r0;
            const wplsPerPulsar = Number(ethers.utils.formatEther(wplsReserve)) / Number(ethers.utils.formatUnits(pulsarReserve, 9));
            const dexPrice = wplsPerPulsar * assetPrices.WPLS;
            if (dexPrice > 0 && Number.isFinite(dexPrice)) timePrice = dexPrice;
        } catch (error) {
            console.warn("Unable to read the PULSAR/WPLS market", error);
        }
    }

    return {
        timePrice,
        wMemoPrice: timePrice * indexFormatted,
    };
}

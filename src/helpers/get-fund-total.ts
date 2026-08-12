import { ethers } from "ethers";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { getAddresses } from "../constants";
import { getProtocolAssetPrices } from "./aave-oracle-price";

/**
 * Returns the treasury balance in USD.
 *
 * The legacy Treasury normalizes reserve-token decimals but does not value
 * WPLS or pDAI in USD. Sum actual balances with live prices so one pDAI, one
 * WPLS, and one USDC are not incorrectly treated as equal dollars.
 */
export const getFundTotal = async (networkID: number, provider: StaticJsonRpcProvider | JsonRpcProvider): Promise<any> => {
    const addresses = getAddresses(networkID);
    const prices = await getProtocolAssetPrices(networkID, provider);
    const reserveAbi = ["function balanceOf(address) view returns(uint256)"];
    const reserves = [
        { address: addresses.MIM_ADDRESS, decimals: 6, symbol: "USDC" },
        { address: addresses.PDAI_ADDRESS, decimals: 18, symbol: "PDAI" },
        { address: addresses.WPLS_ADDRESS, decimals: 18, symbol: "WPLS" },
    ].filter(reserve => Boolean(reserve.address));

    const balances = await Promise.all(reserves.map(async reserve => {
        const token = new ethers.Contract(reserve.address, reserveAbi, provider);
        const balance = await token.balanceOf(addresses.TREASURY_ADDRESS);
        return Number(ethers.utils.formatUnits(balance, reserve.decimals)) * prices[reserve.symbol];
    }));
    const total = balances.reduce((sum, value) => sum + value, 0);

    return {
        total,
        zapper: {},
    };
};

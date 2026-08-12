import { ethers } from "ethers";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { getAddresses } from "../constants/addresses";

export interface ProtocolAssetPrices {
    USDC: number;
    WPLS: number;
    PDAI: number;
    [symbol: string]: number;
}

const EMPTY_PRICES: ProtocolAssetPrices = { USDC: 0, WPLS: 0, PDAI: 0 };

/** Read the live 8-decimal USD prices used by the deployed bond adapters. */
export async function getProtocolAssetPrices(
    networkID: number,
    provider: StaticJsonRpcProvider | JsonRpcProvider,
): Promise<ProtocolAssetPrices> {
    const addresses = getAddresses(networkID);
    if (!addresses.AAVE_ORACLE_ADDRESS) return EMPTY_PRICES;

    try {
        const oracle = new ethers.Contract(addresses.AAVE_ORACLE_ADDRESS, [
            "function BASE_CURRENCY_UNIT() view returns(uint256)",
            "function getAssetsPrices(address[]) view returns(uint256[])",
        ], provider);
        const [unit, prices] = await Promise.all([
            oracle.BASE_CURRENCY_UNIT(),
            oracle.getAssetsPrices([
                addresses.USDC_PRICE_ASSET_ADDRESS,
                addresses.WPLS_PRICE_ASSET_ADDRESS,
                addresses.PDAI_PRICE_ASSET_ADDRESS,
            ]),
        ]);
        const divisor = Number(unit);
        if (!Number.isFinite(divisor) || divisor <= 0) return EMPTY_PRICES;
        return {
            USDC: Number(prices[0]) / divisor,
            WPLS: Number(prices[1]) / divisor,
            PDAI: Number(prices[2]) / divisor,
        };
    } catch (error) {
        console.warn("Unable to read AaveOracleFetch prices", error);
        return EMPTY_PRICES;
    }
}


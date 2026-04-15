import axios from "axios";

// Stable defaults so UI renders correctly even when Coingecko is unavailable.
// USDC is always $1; WPLS price at testnet launch ($0.000008921).
const cache: { [key: string]: number } = {
    USDC: 1,
    MIM: 1,
    WPLS: 0.000008921,
};

export const loadTokenPrices = async () => {
    try {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2,weth,magic-internet-money,betswap-gg,bitcoin&vs_currencies=usd";
        const { data } = await axios.get(url);

        cache["AVAX"] = data["avalanche-2"].usd;
        cache["WAVAX"] = data["avalanche-2"].usd;
        cache["MIM"] = data["magic-internet-money"].usd;
        cache["WETH"] = data["weth"].usd;
        cache["BSGG"] = data["betswap-gg"].usd;
        cache["WBTC"] = data["bitcoin"].usd;
    } catch (e) {
        console.warn("Coingecko price fetch failed – using cached defaults:", e);
    }
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol]);
};

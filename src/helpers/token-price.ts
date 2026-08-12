import axios from "axios";

// Do not silently substitute historical WPLS or pDAI prices. A zero value makes
// unavailable market data visible instead of producing incorrect bond values.
const cache: { [key: string]: number } = {
    USDC: 1,
    MIM: 1,
    PLS: 0,
    WPLS: 0,
    PDAI: 0,
};

export const loadTokenPrices = async () => {
    try {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2,weth,magic-internet-money,betswap-gg,bitcoin,pulsechain,wrapped-pulse-wpls,dai-on-pulsechain&vs_currencies=usd";
        const { data } = await axios.get(url);

        cache["AVAX"] = data["avalanche-2"].usd;
        cache["WAVAX"] = data["avalanche-2"].usd;
        cache["MIM"] = data["magic-internet-money"].usd;
        cache["WETH"] = data["weth"].usd;
        cache["BSGG"] = data["betswap-gg"].usd;
        cache["WBTC"] = data["bitcoin"].usd;
        const plsPrice = Number(data["wrapped-pulse-wpls"]?.usd ?? data["pulsechain"]?.usd);
        cache["PLS"] = Number.isFinite(plsPrice) ? plsPrice : 0;
        cache["WPLS"] = cache["PLS"];
        const pdaiPrice = Number(data["dai-on-pulsechain"]?.usd);
        cache["PDAI"] = Number.isFinite(pdaiPrice) ? pdaiPrice : 0;
        cache["USDC"] = 1;
    } catch (e) {
        console.warn("Coingecko price fetch failed – using cached defaults:", e);
    }
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol] ?? 0);
};

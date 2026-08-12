import { Networks } from "./blockchain";

interface IChainAddresses {
    [key: string]: string;
}

const PULSE_MAINNET: IChainAddresses = {
    DAO_ADDRESS: import.meta.env.VITE_DAO_ADDRESS || "",
    QUASAR_ADDRESS: import.meta.env.VITE_QUASAR_ADDRESS || "",
    PULSAR_ADDRESS: import.meta.env.VITE_PULSAR_ADDRESS || "",
    // Legacy UI field name; this is the selected real/mock USDC principal.
    MIM_ADDRESS: import.meta.env.VITE_USDC_ADDRESS || "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07",
    STAKING_ADDRESS: import.meta.env.VITE_STAKING_ADDRESS || "",
    STAKING_HELPER_ADDRESS: import.meta.env.VITE_STAKING_HELPER_ADDRESS || "",
    DISTRIBUTOR_ADDRESS: import.meta.env.VITE_DISTRIBUTOR_ADDRESS || "",
    PULSAR_BONDING_CALC_ADDRESS: import.meta.env.VITE_BONDING_CALC_ADDRESS || "",
    TREASURY_ADDRESS: import.meta.env.VITE_TREASURY_ADDRESS || "",
    WRAPPED_QUASAR_ADDRESS: import.meta.env.VITE_WRAPPED_QUASAR_ADDRESS || "",
    WPLS_ADDRESS: import.meta.env.VITE_WPLS_ADDRESS || "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
    PDAI_ADDRESS: import.meta.env.VITE_PDAI_ADDRESS || "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    LP_PAIR_PULSARPDAI: import.meta.env.VITE_PULSAR_PDAI_LP_ADDRESS || "",
    LP_PAIR_TIMEUSDC: "",
    LP_PAIR_TIMEWPLS: "",

    // Live 8-decimal USD prices. Mock principals use these real-token price references.
    AAVE_ORACLE_ADDRESS: import.meta.env.VITE_AAVE_ORACLE_ADDRESS || "0x0f907F1D586302AD04283f5739bA20f28fD7cBC6",
    USDC_PRICE_ASSET_ADDRESS: import.meta.env.VITE_USDC_PRICE_ASSET_ADDRESS || "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07",
    WPLS_PRICE_ASSET_ADDRESS: import.meta.env.VITE_WPLS_PRICE_ASSET_ADDRESS || "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
    PDAI_PRICE_ASSET_ADDRESS: import.meta.env.VITE_PDAI_PRICE_ASSET_ADDRESS || "0x6B175474E89094C44Da98b954EedeAC495271d0F",

    ZAPIN_ADDRESS: "",
    ZAPIN_LP_ADDRESS: "",
    ANYSWAP_ADDRESS: "",
    ANY_WRAPPED_QUASAR_ADDRESS: "",
    BSGG_MIM_LP: "",
    FARM_ADDRESS: "",
    REDEMPTION_ADDRESS: "",
};

export const getAddresses = (networkID: number) => {
    if (networkID === Networks.PULSE) return PULSE_MAINNET;
    throw Error("Network not supported");
};

export const ADRESSES_LIST = [
    "0x1c46450211cb2646cc1da3c5242422967ed9e04c",
    "0x355d72fb52ad4591b2066e43e89a7a38cf5cb341",
    "0x78a9e536ebda08b5b9edbe5785c9d1d50fa3278c",
    "0xb6b80f4ea8fb4117928d3c819e8ac6f1a3837baf",
];

export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
export const TOKEN_DECIMALS = 9;

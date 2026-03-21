import { Networks } from "./blockchain";

interface IChainAddresses {
    [key: string]: string;
}

const PULSE_MAINNET: IChainAddresses = {
    DAO_ADDRESS: "",
    MEMO_ADDRESS: "",
    TIME_ADDRESS: "",
    MIM_ADDRESS: "",
    STAKING_ADDRESS: "",
    STAKING_HELPER_ADDRESS: "",
    TIME_BONDING_CALC_ADDRESS: "",
    TREASURY_ADDRESS: "",
    ZAPIN_ADDRESS: "",
    ZAPIN_LP_ADDRESS: "",
    WMEMO_ADDRESS: "",
    ANYSWAP_ADDRESS: "",
    ANY_WMEMO_ADDRESS: "",
    BSGG_MIM_LP: "",
    FARM_ADDRESS: "",
    REDEMPTION_ADDRESS: "",
};

const PULSE_TESTNET: IChainAddresses = {
    DAO_ADDRESS: "",
    MEMO_ADDRESS: "",
    TIME_ADDRESS: "",
    MIM_ADDRESS: "",
    STAKING_ADDRESS: "",
    STAKING_HELPER_ADDRESS: "",
    TIME_BONDING_CALC_ADDRESS: "",
    TREASURY_ADDRESS: "",
    ZAPIN_ADDRESS: "",
    ZAPIN_LP_ADDRESS: "",
    WMEMO_ADDRESS: "",
    ANYSWAP_ADDRESS: "",
    ANY_WMEMO_ADDRESS: "",
    BSGG_MIM_LP: "",
    FARM_ADDRESS: "",
    REDEMPTION_ADDRESS: "",
};

export const getAddresses = (networkID: number) => {
    if (networkID === Networks.PULSE) return PULSE_MAINNET;
    if (networkID === Networks.PULSE_TESTNET) return PULSE_TESTNET;

    throw Error("Network don't support");
};

export const ADRESSES_LIST = [
    "0x1c46450211cb2646cc1da3c5242422967ed9e04c",
    "0x355d72fb52ad4591b2066e43e89a7a38cf5cb341",
    "0x78a9e536ebda08b5b9edbe5785c9d1d50fa3278c",
    "0xb6b80f4ea8fb4117928d3c819e8ac6f1a3837baf",
];

export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

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
    DAO_ADDRESS:              "0x4Aa6Da4ca5d76e8d5e3ACD11B92Ab22D564F1fcb",
    TIME_ADDRESS:             "0xb0e21e5D5fceC4870332c7f0D0eB6641FaD16Ea1",
    MEMO_ADDRESS:             "0x50310D7224Bd0bA77fC26Ba4ee6cef7D4eEa90DB",
    WMEMO_ADDRESS:            "0xF40159d1699c15429Ad13360E87A8708ef1255D2",
    // MockUSDC — deployed because testnet has no real USDC
    MIM_ADDRESS:              "0x9131d71A23e0cdd8F0086ea525D1076B72a749eD",
    STAKING_ADDRESS:          "0x4f80778d18fA51A4243728bBdD41017c3d3D65D2",
    STAKING_HELPER_ADDRESS:   "0xD838985440dcE163724b12D478C2846DE6a64924",
    DISTRIBUTOR_ADDRESS:      "0xD629612fed09BC583Ac22a0f57De49A89b953A59",
    TIME_BONDING_CALC_ADDRESS:"0x7353db33986d710641Dac0DcD0c73C27ac8DE907",
    TREASURY_ADDRESS:         "0xBda059C9a19C9bb2428c57c4C7744D17cB78884A",
    // Not deployed on testnet
    ZAPIN_ADDRESS:        "",
    ZAPIN_LP_ADDRESS:     "",
    ANYSWAP_ADDRESS:      "",
    ANY_WMEMO_ADDRESS:    "",
    BSGG_MIM_LP:          "",
    FARM_ADDRESS:         "",
    REDEMPTION_ADDRESS:   "",
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

export const TOKEN_DECIMALS = 9;

export enum Networks {
    PULSE = 369,
    PULSE_TESTNET = 943,
}

export const DEFAULD_NETWORK = Networks.PULSE;

export const AVAILABLE_CHAINS = [Networks.PULSE, Networks.PULSE_TESTNET];
export const WMEMO_BRIDG_CHAINS = [Networks.PULSE, Networks.PULSE_TESTNET];

export const NetworksInfo = {
    [Networks.PULSE]: {
        chainId: "0x171",
        chainName: "PulseChain",
        shortName: "PLS",
        rpcUrls: ["https://rpc-pulsechain.g4mm4.io"],
        blockExplorerUrls: ["https://scan.mypinata.cloud/ipfs/bafybeih3olry3is4e4lzm7rus5l3h6zrphcal5a7ayfkhzm5oivjro2cp4/#"],
        nativeCurrency: {
            name: "Pulse",
            symbol: "PLS",
            decimals: 18,
        },
        img: "/pulse-logo.png",
    },
    [Networks.PULSE_TESTNET]: {
        chainId: "0x3AF",
        chainName: "PulseChain Testnet",
        shortName: "tPLS",
        rpcUrls: ["https://rpc-testnet-pulsechain.g4mm4.io"],
        blockExplorerUrls: ["https://scan.v4.testnet.pulsechain.com"],
        nativeCurrency: {
            name: "Test Pulse",
            symbol: "tPLS",
            decimals: 18,
        },
        img: "/pulse-logo.png",
    },
};

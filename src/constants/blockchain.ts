export enum Networks {
    PULSE = 369,
}

export const DEFAULD_NETWORK = Networks.PULSE;
export const AVAILABLE_CHAINS = [Networks.PULSE];
export const QUASAR_BRIDGE_CHAINS = [Networks.PULSE];

export const NetworksInfo = {
    [Networks.PULSE]: {
        chainId: "0x171",
        chainName: "PulseChain",
        shortName: "PLS",
        rpcUrls: ["https://rpc-pulsechain.g4mm4.io"],
        blockExplorerUrls: ["https://scan.pulsechain.com"],
        nativeCurrency: {
            name: "Pulse",
            symbol: "PLS",
            decimals: 18,
        },
        img: "/pulse-logo.png",
    },
};

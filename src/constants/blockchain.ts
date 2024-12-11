export const TOKEN_DECIMALS = 9;

export enum Networks {
    // AVAX = 43114,
    BASE_SEPOLIA = 84532,
}

// export const DEFAULD_NETWORK = Networks.AVAX;
export const DEFAULD_NETWORK = Networks.BASE_SEPOLIA;

export const NetworksInfo = {
    // [Networks.AVAX]: {
    //     chainId: "0xa86a",
    //     chainName: "Avalanche",
    //     shortName: "AVAX",
    //     rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    //     blockExplorerUrls: ["https://cchain.explorer.avax.network/"],
    //     nativeCurrency: {
    //         name: "AVAX",
    //         symbol: "AVAX",
    //         decimals: 18,
    //     },
    //     // img: AvaxIcon,
    // },
    [Networks.BASE_SEPOLIA]: {
        chainId: "0x14A34",
        chainName: "Base sepolia",
        shortName: "Base",
        rpcUrls: ["https://base-sepolia-rpc.publicnode.com", "https://sepolia.base.org"],
        blockExplorerUrls: ["https://sepolia.basescan.org/"],
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        // img: FtmIcon,
    },
};

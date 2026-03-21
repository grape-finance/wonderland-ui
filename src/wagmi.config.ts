import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, injectedWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import type { Wallet } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import type { Chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "YOUR_WALLETCONNECT_PROJECT_ID";

export const pulsechain: Chain = {
    id: 369,
    name: "PulseChain",
    network: "pulsechain",
    nativeCurrency: { name: "Pulse", symbol: "PLS", decimals: 18 },
    rpcUrls: {
        default: "https://rpc-pulsechain.g4mm4.io",
        public: "https://rpc-pulsechain.g4mm4.io",
        webSocket: "wss://rpc-pulsechain.g4mm4.io",
    },
    blockExplorers: {
        default: {
            name: "PulseScan",
            url: "https://scan.mypinata.cloud/ipfs/bafybeih3olry3is4e4lzm7rus5l3h6zrphcal5a7ayfkhzm5oivjro2cp4/#",
        },
    },
};

export const pulsechainTestnet: Chain = {
    id: 943,
    name: "PulseChain Testnet",
    network: "pulsechain-testnet",
    nativeCurrency: { name: "Test Pulse", symbol: "tPLS", decimals: 18 },
    rpcUrls: {
        default: "https://rpc-testnet-pulsechain.g4mm4.io",
        public: "https://rpc-testnet-pulsechain.g4mm4.io",
        webSocket: "wss://pulsechain-testnet-rpc.publicnode.com",
    },
    blockExplorers: {
        default: { name: "PulseScan Testnet", url: "https://scan.v4.testnet.pulsechain.com" },
    },
    testnet: true,
};

const rabbyWallet = ({ chains }: { chains: Chain[] }): Wallet => ({
    id: "rabby",
    name: "Rabby Wallet",
    iconUrl: "https://rabby.io/assets/images/logo-128.png",
    iconBackground: "#7a7cff",
    downloadUrls: {
        chrome: "https://chrome.google.com/webstore/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch",
    },
    createConnector: () => {
        const connector = new InjectedConnector({
            chains,
            options: {
                name: "Rabby Wallet",
                getProvider: () => (typeof window !== "undefined" ? (window as any).rabby : undefined),
            },
        });
        return { connector };
    },
});

export const { chains, provider } = configureChains(
    [pulsechain, pulsechainTestnet],
    [
        jsonRpcProvider({
            rpc: chain => ({ http: chain.rpcUrls.default as string }),
        }),
    ],
);

const connectors = connectorsForWallets([
    {
        groupName: "Recommended",
        wallets: [
            injectedWallet({ chains }),
            metaMaskWallet({ chains, projectId }),
            rabbyWallet({ chains }),
            walletConnectWallet({ chains, projectId }),
            coinbaseWallet({ chains, appName: "Wonderland Finance" }),
        ],
    },
]);

export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

import React, { ReactElement, useContext, useMemo, useCallback, useEffect, useState } from "react";
import { StaticJsonRpcProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useAccount, useDisconnect, useSigner, useSwitchNetwork, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getMainnetURI } from "./helpers";
import { DEFAULD_NETWORK, AVAILABLE_CHAINS } from "../../constants";
import { Networks } from "../../constants";
import { messages } from "../../constants/messages";

type onChainProvider = {
    connect: () => Promise<Web3Provider>;
    switchNetwork: (chain: Networks) => void;
    disconnect: () => void;
    checkWrongNetwork: () => Promise<boolean>;
    provider: JsonRpcProvider;
    address: string;
    connected: Boolean;
    web3Modal: null;
    chainID: number;
    web3?: any;
    providerChainID: number;
    hasCachedProvider: () => boolean;
};

export type Web3ContextData = {
    onChainProvider: onChainProvider;
} | null;

const Web3Context = React.createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
    const web3Context = useContext(Web3Context);
    if (!web3Context) {
        throw new Error("useWeb3Context() can only be used inside of <Web3ContextProvider />, " + "please declare it at a higher level.");
    }
    const { onChainProvider } = web3Context;
    return useMemo(() => {
        return { ...onChainProvider };
    }, [web3Context]);
};

export const useAddress = () => {
    const { address } = useWeb3Context();
    return address;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
    const { address: wagmiAddress, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { switchNetwork: wagmiSwitchNetwork } = useSwitchNetwork();
    const { data: signer } = useSigner();

    const walletChainId = chain?.id;
    const [chainID, setChainID] = useState(DEFAULD_NETWORK);

    useEffect(() => {
        if (walletChainId && AVAILABLE_CHAINS.includes(walletChainId)) {
            setChainID(walletChainId);
        }
    }, [walletChainId]);

    const provider = useMemo((): JsonRpcProvider => {
        if (signer?.provider && isConnected) {
            return signer.provider as Web3Provider;
        }
        return new StaticJsonRpcProvider(getMainnetURI(chainID));
    }, [signer, isConnected, chainID]);

    const connect = useCallback(async (): Promise<Web3Provider> => {
        openConnectModal?.();
        return provider as Web3Provider;
    }, [openConnectModal, provider]);

    const disconnect = useCallback(() => {
        wagmiDisconnect();
    }, [wagmiDisconnect]);

    const switchNetwork = useCallback(
        (chainId: Networks) => {
            wagmiSwitchNetwork?.(chainId);
        },
        [wagmiSwitchNetwork],
    );

    const checkWrongNetwork = useCallback(async (): Promise<boolean> => {
        if (!walletChainId || !AVAILABLE_CHAINS.includes(walletChainId)) {
            const shouldSwitch = window.confirm(messages.switch_to_avalanche);
            if (shouldSwitch) {
                wagmiSwitchNetwork?.(DEFAULD_NETWORK);
            }
            return true;
        }
        return false;
    }, [walletChainId, wagmiSwitchNetwork]);

    // wagmi autoConnect handles reconnection
    const hasCachedProvider = useCallback((): boolean => false, []);

    const onChainProvider = useMemo(
        () => ({
            connect,
            disconnect,
            hasCachedProvider,
            provider,
            connected: isConnected,
            address: wagmiAddress ?? "",
            chainID,
            web3Modal: null,
            providerChainID: walletChainId ?? DEFAULD_NETWORK,
            checkWrongNetwork,
            switchNetwork,
        }),
        [connect, disconnect, hasCachedProvider, provider, isConnected, wagmiAddress, chainID, walletChainId, checkWrongNetwork, switchNetwork],
    );

    return <Web3Context.Provider value={{ onChainProvider }}>{children}</Web3Context.Provider>;
};

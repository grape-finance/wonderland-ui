import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useWeb3Context } from "../../../hooks";
import { IReduxState } from "../../../store/slices/state.interface";
import { IPendingTxn } from "../../../store/slices/pending-txns-slice";
import "./connect-menu.scss";
import CircularProgress from "@mui/material/CircularProgress";
import { AVAILABLE_CHAINS } from "../../../constants/blockchain";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function ConnectMenu() {
    const { disconnect, connected, providerChainID, checkWrongNetwork } = useWeb3Context();
    const [isConnected, setIsConnected] = useState(connected);

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => state.pendingTransactions);

    useEffect(() => {
        setIsConnected(connected);
    }, [connected]);

    return (
        <ConnectButton.Custom>
            {({ openConnectModal }) => {
                let buttonText = "Connect Wallet";
                let clickFunc: () => void = openConnectModal;
                let buttonStyle: React.CSSProperties = {};

                if (isConnected) {
                    buttonText = "Disconnect";
                    clickFunc = disconnect;
                }

                if (pendingTransactions && pendingTransactions.length > 0) {
                    buttonText = `${pendingTransactions.length} Pending `;
                    clickFunc = () => {};
                }

                if (isConnected && !AVAILABLE_CHAINS.includes(providerChainID)) {
                    buttonText = "Wrong network";
                    buttonStyle = { backgroundColor: "rgb(255, 67, 67)" };
                    clickFunc = () => {
                        checkWrongNetwork();
                    };
                }

                return (
                    <div className="connect-button" style={buttonStyle} onClick={clickFunc}>
                        <p>{buttonText}</p>
                        {pendingTransactions.length > 0 && (
                            <div className="connect-button-progress">
                                <CircularProgress size={15} color="inherit" />
                            </div>
                        )}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}

export default ConnectMenu;

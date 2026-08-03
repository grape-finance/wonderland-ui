import { useState } from "react";
import { getAddresses, TOKEN_DECIMALS, DEFAULD_NETWORK } from "../../../constants";
import { Link, Fade, Popper } from "@mui/material";
import "./time-menu.scss";

const addTokenToWallet =
    (tokenSymbol: string, tokenAddress: string, tokenDecimals = TOKEN_DECIMALS) =>
    async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: "wallet_watchAsset",
                    params: {
                        type: "ERC20",
                        options: {
                            address: tokenAddress,
                            symbol: tokenSymbol,
                            decimals: tokenDecimals,
                        },
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
    };

function TimeMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const isEthereumAPIAvailable = window.ethereum;

    const addresses = getAddresses(DEFAULD_NETWORK);

    const QUASAR_ADDRESS = addresses.QUASAR_ADDRESS;
    const PULSAR_ADDRESS = addresses.PULSAR_ADDRESS;
    const wQUASAR_ADDRESS = addresses.WRAPPED_QUASAR_ADDRESS;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);

    return (
        <div className="time-menu-root" onMouseEnter={e => handleClick(e)} onMouseLeave={e => handleClick(e)}>
            <div className="time-menu-btn">
                <p>QUASAR</p>
            </div>

            <Popper className="time-menu-popper" open={open} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <div className="tooltip">
                            <Link
                                className="tooltip-item"
                                href={
                                    "https://avalanche.sushi.com/swap?inputCurrency=0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b&outputCurrency=0x130966628846BFd36ff31a822705796e8cb8C18D"
                                }
                                target="_blank"
                            >
                                <p>Buy on Sushi</p>
                            </Link>

                            {isEthereumAPIAvailable && (
                                <div className="add-tokens">
                                    <div className="divider" />
                                    <p className="add-tokens-title">ADD TOKEN TO WALLET</p>
                                    <div className="divider" />
                                    <div className="tooltip-item" onClick={addTokenToWallet("QUASAR", wQUASAR_ADDRESS, 18)}>
                                        <p>QUASAR</p>
                                    </div>
                                    <div className="tooltip-item" onClick={addTokenToWallet("PULSAR", PULSAR_ADDRESS)}>
                                        <p>PULSAR</p>
                                    </div>
                                    <div className="tooltip-item" onClick={addTokenToWallet("QUASAR", QUASAR_ADDRESS)}>
                                        <p>QUASAR</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </div>
    );
}

export default TimeMenu;

import React, { useCallback, useState } from "react";
import "./liquidity-banner.scss";
import xIcon from "../../assets/icons/x.svg?react";
import { SvgIcon } from "@mui/material";
import CircleIcon from "../../assets/icons/circle.svg";

function LiquidityBanner() {
    const [showBanner, setShowBanner] = useState(true);

    const handleClose = useCallback(() => setShowBanner(false), []);

    if (!showBanner) {
        return null;
    }

    return (
        <div className="liquidity-banner-root">
            <div className="liquidity-banner-text-conteiner">
                <p className="liquidity-banner-text">Explore the Pulsar Protocol documentation</p>
                <p className="liquidity-banner-text">for product guides and protocol resources.</p>
                <p className="liquidity-banner-text upper">
                    More info{" "}
                    <a target="_blank" rel="noreferrer" href="https://source-code-systems.gitbook.io/pulsarprotocol">
                        here
                    </a>
                </p>
            </div>
            <div className="liquidity-banner-close-wrap" onClick={handleClose}>
                <SvgIcon color="primary" component={xIcon} />
            </div>
            <div className="liquidity-banner-left-circle">
                <img alt="" src={CircleIcon} />
            </div>
            <div className="liquidity-banner-right-circle">
                <img alt="" src={CircleIcon} />
            </div>
        </div>
    );
}

export default LiquidityBanner;

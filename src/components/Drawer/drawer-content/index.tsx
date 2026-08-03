import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import StakeIcon from "../../../assets/icons/stake.svg";
import BondIcon from "../../../assets/icons/bond.svg";
import DashboardIcon from "../../../assets/icons/dashboard.svg";
import { shorten } from "../../../helpers";
import { useAddress, useWeb3Context } from "../../../hooks";
import { Link } from "@mui/material";
import { Skeleton } from "@mui/material";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import GlobeIcon from "../../../assets/icons/orbit.svg";
import classnames from "classnames";
import { VIEWS_FOR_NETWORK } from "../../../constants";

function NavContent() {
    const [isActive] = useState();
    const address = useAddress();
    const { chainID } = useWeb3Context();

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") return true;
        if (currentPath.indexOf("stake") >= 0 && page === "stake") return true;
        if (currentPath.indexOf("calculator") >= 0 && page === "calculator") return true;
        return false;
    }, []);

    return (
        <div className="dapp-sidebar">
            <div className="branding-header">
                <div className="pulsar-brand" aria-label="Pulsar Protocol">
                    <img alt="Pulsar Protocol" src="/pulsar-logo.png" />
                    <div className="pulsar-wordmark">
                        <span>PULSAR</span>
                        <small>PROTOCOL</small>
                    </div>
                </div>

                {address && (
                    <div className="wallet-link">
                        <Link href={`https://scan.mypinata.cloud/ipfs/bafybeih3olry3is4e4lzm7rus5l3h6zrphcal5a7ayfkhzm5oivjro2cp4/#/address/${address}`} target="_blank">
                            <p>{shorten(address)}</p>
                        </Link>
                    </div>
                )}
            </div>

            <div className="dapp-menu-links">
                <div className="dapp-nav">
                    {VIEWS_FOR_NETWORK[chainID]?.dashboard && (
                        <Link
                            component={NavLink}
                            to="/dashboard"
                            isActive={(match: any, location: any) => checkPage(location, "dashboard")}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={DashboardIcon} />
                                <p>Dashboard</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID]?.stake && (
                        <Link
                            component={NavLink}
                            to="/stake"
                            isActive={(match: any, location: any) => checkPage(location, "stake")}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={StakeIcon} />
                                <p>Stake</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID]?.mints && (
                        <Link
                            component={NavLink}
                            to="/mints"
                            isActive={(match: any, location: any) => {
                                const path = location.pathname.replace("/", "");
                                return path.indexOf("mints") >= 0;
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={BondIcon} />
                                <p>Mint</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID]?.calculator && (
                        <Link
                            component={NavLink}
                            to="/calculator"
                            isActive={(match: any, location: any) => checkPage(location, "calculator")}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={GlobeIcon} />
                                <p>Calculator</p>
                            </div>
                        </Link>
                    )}

                </div>
            </div>

            <div className="dapp-menu-doc-link">
                <Link href="https://source-code-systems.gitbook.io/pulsarprotocol" target="_blank" rel="noreferrer">
                    <img alt="" src={DocsIcon} />
                    <p>Docs</p>
                </Link>
            </div>
            <Social />
        </div>
    );
}

export default NavContent;

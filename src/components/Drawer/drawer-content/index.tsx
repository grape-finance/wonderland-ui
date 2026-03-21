import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import StakeIcon from "../../../assets/icons/stake.svg";
import WonderlandIcon from "../../../assets/icons/wonderland-nav-header.svg";
import DashboardIcon from "../../../assets/icons/dashboard.svg";
import { trim, shorten } from "../../../helpers";
import { useAddress, useWeb3Context } from "../../../hooks";
import useBonds from "../../../hooks/bonds";
import { Link } from "@mui/material";
import { Skeleton } from "@mui/material";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import GlobeIcon from "../../../assets/icons/wonderglobe.svg";
import classnames from "classnames";
import { Networks, VIEWS_FOR_NETWORK } from "../../../constants";
import FundIcon from "../../../assets/icons/fund.png";
import RedemptionIcon from "../../../assets/icons/redemption.svg";
import FarmIcon from "../../../assets/icons/farm.svg";

function NavContent() {
    const [isActive] = useState();
    const address = useAddress();
    const { bonds } = useBonds();
    const { chainID } = useWeb3Context();

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") return true;
        if (currentPath.indexOf("stake") >= 0 && page === "stake") return true;
        if (currentPath.indexOf("farm") >= 0 && page === "farm") return true;
        if (currentPath.indexOf("calculator") >= 0 && page === "calculator") return true;
        if (currentPath.indexOf("fund") >= 0 && page === "fund") return true;
        if (currentPath.indexOf("redemption") >= 0 && page === "redemption") return true;
        return false;
    }, []);

    return (
        <div className="dapp-sidebar">
            <div className="branding-header">
                <Link href="https://wonderland.money" target="_blank">
                    <img alt="" src={WonderlandIcon} />
                </Link>

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

                    {VIEWS_FOR_NETWORK[chainID]?.farm && (
                        <Link
                            component={NavLink}
                            to="/farm"
                            isActive={(match: any, location: any) => checkPage(location, "farm")}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={FarmIcon} />
                                <p>Farm</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID]?.fund && (
                        <Link
                            component={NavLink}
                            to="/fund"
                            isActive={(match: any, location: any) => checkPage(location, "fund")}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={FundIcon} />
                                <p>Fund</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID]?.redemption && (
                        <Link
                            component={NavLink}
                            to="/redemption"
                            isActive={(match: any, location: any) => checkPage(location, "redemption")}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={RedemptionIcon} />
                                <p>Redemption</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            <div className="dapp-menu-doc-link">
                <Link href="https://wonderland.gitbook.io/wonderland/" target="_blank">
                    <img alt="" src={DocsIcon} />
                    <p>Docs</p>
                </Link>
            </div>
            <Social />
        </div>
    );
}

export default NavContent;

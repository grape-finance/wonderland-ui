import React, { useState } from "react";
import "./view-base.scss";
import Header from "../Header";
import { Box, useMediaQuery } from "@mui/material";
import { makeStyles } from "@mui/styles";
import type { Theme } from "@mui/material/styles";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import MobileDrawer from "../Drawer/mobile-drawer";
import Drawer from "../Drawer";
import { cubesImage } from "src/constants/img";
import Messages from "../Messages";
import LiquidityBanner from "../LiquidityBanner";
import InfoBanner from "../InfoBanner";
import AirdropBanner from "../AirdropBanner";
import { useWeb3Context } from "../../hooks";
import { Networks } from "../../constants/blockchain";

interface IViewBaseProps {
    children: React.ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
    drawer: {
        [theme.breakpoints.up("md")]: {
            width: DRAWER_WIDTH,
            flexShrink: 0,
        },
    },
    content: {
        padding: theme.spacing(1),
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: TRANSITION_DURATION,
        }),
        height: "100%",
        overflow: "auto",
        marginLeft: DRAWER_WIDTH,
    },
    contentShift: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: TRANSITION_DURATION,
        }),
        marginLeft: 0,
    },
}));

function ViewBase({ children }: IViewBaseProps) {
    const classes = useStyles();

    const [mobileOpen, setMobileOpen] = useState(false);

    const isSmallerScreen = useMediaQuery("(max-width: 960px)");
    const isSmallScreen = useMediaQuery("(max-width: 600px)");

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const { chainID } = useWeb3Context();

    return (
        <div className="view-base-root">
            <Messages />
            <Header drawe={!isSmallerScreen} handleDrawerToggle={handleDrawerToggle} />
            <div className={classes.drawer}>
                <Box sx={{ display: { md: "none" } }}>
                    <MobileDrawer mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Drawer />
                </Box>
            </div>
            <div className={`${classes.content} ${isSmallerScreen && classes.contentShift}`}>
                {!isSmallerScreen && (
                    <div className="cubes-top">
                        <p>{cubesImage}</p>
                    </div>
                )}
                {!isSmallScreen && (
                    <div className="cubes-bottom">
                        <p>{cubesImage}</p>
                    </div>
                )}
                {/* {chainID === Networks.PULSE && <LiquidityBanner />} */}
                {chainID === Networks.PULSE && <AirdropBanner />}
                {chainID === Networks.PULSE && <InfoBanner />}
                {children}
            </div>
        </div>
    );
}

export default ViewBase;

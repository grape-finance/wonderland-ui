import React, { useState } from "react";
import "./view-base.scss";
import Header from "../Header";
import { Box, useMediaQuery } from "@mui/material";
import { makeStyles } from "@mui/styles";
import type { Theme } from "@mui/material/styles";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import MobileDrawer from "../Drawer/mobile-drawer";
import Drawer from "../Drawer";
import Messages from "../Messages";
import LiquidityBanner from "../LiquidityBanner";
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
                <div className="space-orbit space-orbit-one" aria-hidden="true" />
                <div className="space-orbit space-orbit-two" aria-hidden="true" />
                {/* {chainID === Networks.PULSE && <LiquidityBanner />} */}
                {chainID === Networks.PULSE && <AirdropBanner />}
                {children}
            </div>
        </div>
    );
}

export default ViewBase;

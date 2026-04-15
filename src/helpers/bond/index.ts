import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond, NotTimeLpBond } from "./lp-bond";
import { StableBond, CustomBond, StableV2Bond } from "./stable-bond";

import MimIcon from "../../assets/tokens/MIM.svg";
import AvaxIcon from "../../assets/tokens/AVAX.svg";
import MimTimeIcon from "../../assets/tokens/TIME-MIM.svg";
import AvaxTimeIcon from "../../assets/tokens/TIME-AVAX.svg";
import EthIcon from "../../assets/tokens/WETH.e.png";
import wMemoMimIcon from "../../assets/tokens/WMEMO-MIM.png";
// Testnet bonds reuse the closest visual match from existing assets
import UsdcIcon from "../../assets/tokens/MIM.svg";
import WplsIcon from "../../assets/tokens/AVAX.svg";
import TimeUsdcLpIcon from "../../assets/tokens/TIME-MIM.svg";
import TimeWplsLpIcon from "../../assets/tokens/TIME-AVAX.svg";

import { StableBondContract, LpBondContract, WavaxBondContract, StableReserveContract, LpReserveContract, WethBondContract, ProBondContract } from "../../abi";
import { getWmemoMarketPrice } from "../get-wmemo-price";

export const mim = new StableBond({
    name: "mim",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
            reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        },
    },
    tokensInStrategy: "133197631510816554349784677",
    v2Bond: false,
    deprecated: true,
    isAvailable: {
        [Networks.PULSE]: true,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
    },
});

export const mimPro = new StableV2Bond({
    name: "mim-v2",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimIcon,
    bondContractABI: ProBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0x629a650E173B730E0F7C1206BF9f74808F475d1b",
            reserveAddress: "0x82f0b8b456c1a451378467398982d4834b6829c1",
        },
        [Networks.PULSE]: {
            bondAddress: "0x50f40350cbB170B6e5D2cC0859ac84ca17044d0a",
            reserveAddress: "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
        },
        [Networks.PULSE]: {
            bondAddress: "0x17451Eb19D34e6c8404C3188F2fcc46c493146C9",
            reserveAddress: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",
        },
    },
    v2Bond: true,
    isAvailable: {
        [Networks.PULSE]: false,
        [Networks.PULSE]: true,
        [Networks.PULSE]: true,
        [Networks.PULSE]: true,
    },
    disableZap: true,
    deprecated: true,
});

export const wavax = new CustomBond({
    name: "wavax",
    displayName: "wAVAX",
    bondToken: "AVAX",
    bondIconSvg: AvaxIcon,
    bondContractABI: WavaxBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0xE02B1AA2c4BE73093BE79d763fdFFC0E3cf67318",
            reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        },
    },
    tokensInStrategy: "1056916000000000000000000",
    deprecated: true,
    v2Bond: false,
    isAvailable: {
        [Networks.PULSE]: true,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
    },
});

export const weth = new CustomBond({
    name: "weth",
    displayName: "wETH.e",
    bondToken: "WETH",
    bondIconSvg: EthIcon,
    bondContractABI: WethBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0x858636F350fC812C3C88D1578925C502727ab323",
            reserveAddress: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
        },
    },
    tokensInStrategy: "17005026257974854243669",
    v2Bond: false,
    isAvailable: {
        [Networks.PULSE]: true,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
    },
    disableZap: true,
    deprecated: true,
});

export const mimTime = new LPBond({
    name: "mim_time_lp",
    displayName: "TIME-MIM LP",
    bondToken: "MIM",
    bondIconSvg: MimTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0xA184AE1A71EcAD20E822cB965b99c287590c4FFe",
            reserveAddress: "0x113f413371fc4cc4c9d6416cf1de9dfd7bf747df",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
    tokensInStrategy: "68545600000000000000",
    tokensInStrategyReserve: "145304211000000000000000000",
    deprecated: true,
    v2Bond: false,
    isAvailable: {
        [Networks.PULSE]: true,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
    },
});

export const avaxTime = new CustomLPBond({
    name: "avax_time_lp",
    displayName: "TIME-AVAX LP",
    bondToken: "AVAX",
    bondIconSvg: AvaxTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
            reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
    tokensInStrategy: "342013869235866939",
    tokensInStrategyReserve: "90250000000000000000000",
    deprecated: true,
    v2Bond: false,
    isAvailable: {
        [Networks.PULSE]: true,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
    },
});

export const wmemoMim = new NotTimeLpBond({
    name: "wmemo_mim_lp",
    displayName: "wMEMO-MIM SLP",
    bondToken: "MIM",
    bondIconSvg: wMemoMimIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.PULSE]: {
            bondAddress: "0xb0555683EaaAaC027f917B2E0aA2D8f208b82562",
            reserveAddress: "0x4d308c46ea9f234ea515cc51f16fba776451cac8",
        },
    },
    lpUrl: "https://app.sushi.com/add/0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b/0x130966628846BFd36ff31a822705796e8cb8C18D",
    disableZap: true,
    tokenPriceFun: getWmemoMarketPrice,
    v2Bond: false,
    isAvailable: {
        [Networks.PULSE]: true,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
        [Networks.PULSE]: false,
    },
    deprecated: true,
    tokensInStrategy: "40248760911630751941101",
});

// ─── PulseChain Testnet bonds ────────────────────────────────────────────────

export const usdcBond = new StableBond({
    name: "usdc",
    displayName: "USDC",
    bondToken: "USDC",
    bondIconSvg: UsdcIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x9D9747Ec64523E65132fEe1D1c93D15e8de133C3",
            reserveAddress: "0xf43e6c627716c648bEc5873384dA94d3E33A4a25",
        },
    },
    v2Bond: false,
    deprecated: false,
    isAvailable: {
        [Networks.PULSE_TESTNET]: true,
    },
});

export const wplsBond = new CustomBond({
    name: "wpls",
    displayName: "WPLS",
    bondToken: "WPLS",
    bondIconSvg: WplsIcon,
    bondContractABI: WavaxBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x0603145F090BC9dA24D03EacCf1C4E63Ef75B9B1",
            reserveAddress: "0x70499adEBB11Efd915E3b69E700c331778628707",
        },
    },
    v2Bond: false,
    deprecated: false,
    isAvailable: {
        [Networks.PULSE_TESTNET]: true,
    },
});

export const timeUsdcLpBond = new LPBond({
    name: "time_usdc_lp",
    displayName: "TIME-USDC LP",
    bondToken: "USDC",
    bondIconSvg: TimeUsdcLpIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x2367247b680F5C998a4C5785d17c4CDC2cD35D77",
            reserveAddress: "0x9d070B1dA73120C28006a3e3f4DB2b3598646fF1",
        },
    },
    lpUrl: "https://pulsex.mypinata.cloud/ipfs/bafybeidea3ibq4lu5t6vk6ihp4iuznjb3wtm3oq4xjnbhngonjh7bvbe2m/#/?outputCurrency=0xAf5123ED5E87935821e77449Ff0bb00E673033c3",
    v2Bond: false,
    deprecated: false,
    isAvailable: {
        [Networks.PULSE_TESTNET]: true,
    },
});

export const timeWplsLpBond = new CustomLPBond({
    name: "time_wpls_lp",
    displayName: "TIME-WPLS LP",
    bondToken: "WPLS",
    bondIconSvg: TimeWplsLpIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x11389d965b03d1Ed5593404205695a44A407da91",
            reserveAddress: "0x67c4659D6fE88d14508Ad8900D6305C51eF6AcF7",
        },
    },
    lpUrl: "https://pulsex.mypinata.cloud/ipfs/bafybeidea3ibq4lu5t6vk6ihp4iuznjb3wtm3oq4xjnbhngonjh7bvbe2m/#/?outputCurrency=0xAf5123ED5E87935821e77449Ff0bb00E673033c3",
    v2Bond: false,
    deprecated: false,
    isAvailable: {
        [Networks.PULSE_TESTNET]: true,
    },
});

export default [mim, wavax, weth, avaxTime, mimTime, wmemoMim, mimPro, usdcBond, wplsBond, timeUsdcLpBond, timeWplsLpBond];

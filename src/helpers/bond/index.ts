import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond, NotTimeLpBond } from "./lp-bond";
import { StableBond, CustomBond, StableV2Bond } from "./stable-bond";

import MimIcon from "../../assets/tokens/MIM.svg";
import AvaxIcon from "../../assets/tokens/AVAX.svg";
import MimTimeIcon from "../../assets/tokens/TIME-MIM.svg";
import AvaxTimeIcon from "../../assets/tokens/TIME-AVAX.svg";
import EthIcon from "../../assets/tokens/WETH.e.png";
import wMemoMimIcon from "../../assets/tokens/WMEMO-MIM.png";
// Testnet bond icons
import UsdcIcon from "../../assets/tokens/USDC.png";
import WplsIcon from "../../assets/tokens/pulse.png";
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
    reserveDecimals: 6,
    disableZap: true,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0xC3da889bE5899F5f7c1f85147AA09a8bC6505fF1",
            reserveAddress: "0x9131d71A23e0cdd8F0086ea525D1076B72a749eD",
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
    disableZap: true,
    // EthBondDepository: bondPriceInUSD = bondPrice() × assetPrice(oracle) × 1e6
    // Display formula: bondPriceRaw / 1e16  (NOT formatUnits(raw, 18))
    isEthBond: true,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x422198AD5C252a4fe38d430f4cBD29687Ea51A3c",
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
    disableZap: true,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x2766EA82510CC3c306D5c8545182642e08CAe7f2",
            reserveAddress: "0x67E352F4941Ce14643Ab8382eF41aB5173f1258f",
        },
    },
    lpUrl: "https://pulsex.mypinata.cloud/ipfs/bafybeidea3ibq4lu5t6vk6ihp4iuznjb3wtm3oq4xjnbhngonjh7bvbe2m/#/?outputCurrency=0xb0e21e5D5fceC4870332c7f0D0eB6641FaD16Ea1",
    v2Bond: false,
    deprecated: true,
    isAvailable: {
        [Networks.PULSE_TESTNET]: false,
    },
});

export const timeWplsLpBond = new CustomLPBond({
    name: "time_wpls_lp",
    displayName: "TIME-WPLS LP",
    bondToken: "WPLS",
    bondIconSvg: TimeWplsLpIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    disableZap: true,
    networkAddrs: {
        [Networks.PULSE_TESTNET]: {
            bondAddress: "0x997c367125Ca92CcdB15AA62DACfB599e24c38A8",
            reserveAddress: "0x1702baa9aaD25664D96756a568FE8550c34C6B7b",
        },
    },
    lpUrl: "https://pulsex.mypinata.cloud/ipfs/bafybeidea3ibq4lu5t6vk6ihp4iuznjb3wtm3oq4xjnbhngonjh7bvbe2m/#/?outputCurrency=0xb0e21e5D5fceC4870332c7f0D0eB6641FaD16Ea1",
    v2Bond: false,
    // StandardBondingCalculator.markdown() was designed for stablecoins (MIM/USDC).
    // For WPLS (18 dec, $0.000009/token) the formula returns astronomical values.
    // Disabling until a custom oracle-aware BondingCalculator is deployed.
    deprecated: true,
    isAvailable: {
        [Networks.PULSE_TESTNET]: false,
    },
});

export default [mim, wavax, weth, avaxTime, mimTime, wmemoMim, mimPro, usdcBond, wplsBond, timeUsdcLpBond, timeWplsLpBond];

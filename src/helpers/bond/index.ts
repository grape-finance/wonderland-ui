import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";

import MimIcon from "../../assets/tokens/MIM.svg";
import AvaxIcon from "../../assets/tokens/AVAX.svg";
import MimTimeIcon from "../../assets/tokens/TIME-MIM.svg";
import AvaxTimeIcon from "../../assets/tokens/TIME-AVAX.svg";

import { StableBondContract, LpBondContract, WavaxBondContract, StableReserveContract, LpReserveContract } from "../../abi";

export const mim = new StableBond({
    name: "mim",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        // [Networks.AVAX]: {
        //     bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
        //     reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        // },
        [Networks.BASE_SEPOLIA]: {
            bondAddress: "0x23e294767680119810b428970Bc9D4A07Ed3dB6B",
            reserveAddress: "0xa1984E1545a8Aa5a85db5b6AC6D8a4Aaf39B72dF",
        },
    },
    tokensInStrategy: "60500000000000000000000000",
});

export const wavax = new CustomBond({
    name: "wavax",
    displayName: "wAVAX",
    bondToken: "AVAX",
    bondIconSvg: AvaxIcon,
    bondContractABI: WavaxBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        // [Networks.AVAX]: {
        //     bondAddress: "0xE02B1AA2c4BE73093BE79d763fdFFC0E3cf67318",
        //     reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        // },
        [Networks.BASE_SEPOLIA]: {
            bondAddress: "0x34eBa6B734De9943ac8947e975a24E12747BeA2a",
            reserveAddress: "0x24fe7807089e321395172633aA9c4bBa4Ac4a357",
        },
    },
    tokensInStrategy: "756916000000000000000000",
});

export const mimTime = new LPBond({
    name: "mim_time_lp",
    displayName: "TIME-MIM LP",
    bondToken: "MIM",
    bondIconSvg: MimTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        // [Networks.AVAX]: {
        //     bondAddress: "0xA184AE1A71EcAD20E822cB965b99c287590c4FFe",
        //     reserveAddress: "0x113f413371fc4cc4c9d6416cf1de9dfd7bf747df",
        // },
        [Networks.BASE_SEPOLIA]: {
            bondAddress: "0xD0929971C59539C91825a6CDc1921Bf0D4BC38bC",
            reserveAddress: "0x25B74cD5E43e5f9cBA4c18093b09F5275803107d",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
});

export const avaxTime = new CustomLPBond({
    name: "avax_time_lp",
    displayName: "TIME-AVAX LP",
    bondToken: "AVAX",
    bondIconSvg: AvaxTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        // [Networks.AVAX]: {
        //     bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
        //     reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
        // },
        [Networks.BASE_SEPOLIA]: {
            bondAddress: "0xeCD9D9F38E0983539B873B7883439dAC5f2951e1",
            reserveAddress: "0xE4c1e3f0Fca2949d78d53cAde8F08D5b9Cc6beFC",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
});

export default [mim, wavax, mimTime, avaxTime];

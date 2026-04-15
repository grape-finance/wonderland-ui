import { Networks } from "./blockchain";

interface IViewsForNetwork {
    dashboard: boolean;
    stake: boolean;
    mints: boolean;
    calculator: boolean;
    farm: boolean;
    fund: boolean;
    redemption: boolean;
}

export const VIEWS_FOR_NETWORK: { [key: number]: IViewsForNetwork } = {
    [Networks.PULSE]: {
        dashboard: true,
        stake: true,
        mints: false,
        calculator: true,
        farm: true,
        fund: true,
        redemption: true,
    },
    [Networks.PULSE_TESTNET]: {
        dashboard: true,
        stake: true,
        mints: true,
        calculator: true,
        farm: false,
        fund: false,
        redemption: false,
    },
};

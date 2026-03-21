import { Networks } from "../constants/blockchain";
import { wmemoMim } from "../helpers/bond";
import { simpleProvider } from "./simpleProvider";

export async function getWmemoMarketPrice(): Promise<number> {
    const provider = simpleProvider(Networks.PULSE);

    const pairContract = wmemoMim.getContractForReserve(Networks.PULSE, provider);
    const reserves = await pairContract.getReserves();

    const marketPrice = reserves[1] / reserves[0];

    return marketPrice;
}

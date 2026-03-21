import { useMemo } from "react";
import { mergeData } from "src/helpers/dataSource";
import { DataSource } from "./types";
import { useChainList } from "./useChainList";
import { IZapperData } from "src/store/slices/app-slice";

const EMPTY_ZAPPER: IZapperData = { wallet: [], vaults: [], leveragedPosition: [], liquidityPool: [], claimable: [], debt: [], farm: [] };

export const useDataSource = (data: IZapperData): DataSource => {
    const chainList = useChainList();
    return useMemo(() => mergeData(data ?? EMPTY_ZAPPER, { wallet: [], vaults: [], leveragedPosition: [], liquidityPool: [], claimable: [], debt: [], farm: [] }, chainList), [data, chainList]);
};

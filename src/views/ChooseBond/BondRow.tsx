import { priceUnits, trim } from "../../helpers";
import BondLogo from "../../components/BondLogo";
import { Paper, TableRow, TableCell, Slide, Link } from "@mui/material";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { Skeleton } from "@mui/material";
import { IAllBondData } from "../../hooks/bonds";
import classNames from "classnames";

/**
 * Format a bond price with enough decimal places to be meaningful.
 * Prices < $0.01 (e.g. WPLS at $0.0018) need more than 2 decimal places.
 */
function trimPrice(price: number): string {
    if (!price || price <= 0) return "0.00";
    if (price >= 1)    return trim(price, 2);
    if (price >= 0.01) return trim(price, 4);
    if (price >= 0.0001) return trim(price, 6);
    return price.toFixed(8);
}

interface IBondProps {
    bond: IAllBondData;
}

export function BondDataCard({ bond }: IBondProps) {
    const isBondLoading = bond.deprecated ? false : bond.bondPrice === undefined || bond.bondPrice === null;

    return (
        <Slide direction="up" in={true}>
            <Paper className="bond-data-card">
                <div className="bond-pair">
                    <BondLogo bond={bond} />
                    <div className="bond-name">
                        <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>{bond.displayName}</p>
                        {bond.isLP && (
                            <div>
                                <Link href={bond.lpUrl} target="_blank">
                                    <p className="bond-name-title">View Contract</p>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="data-row">
                    <p className="bond-name-title">Price</p>
                    <p className={classNames("bond-price bond-name-title", { deprecated: bond.deprecated })}>
                        <>
                            {priceUnits(bond)} {isBondLoading ? <Skeleton width="50px" /> : trimPrice(bond.deprecated ? 0 : bond.bondPrice)}
                        </>
                    </p>
                </div>

                <div className="data-row">
                    <p className="bond-name-title">ROI</p>
                    <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>
                        {isBondLoading ? <Skeleton width="50px" /> : bond.soldOut ? "Sold out" : `${trim(bond.deprecated ? 0 : bond.bondDiscount * 100, 2)}%`}
                    </p>
                </div>

                <div className="data-row">
                    <p className="bond-name-title">Purchased</p>
                    <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>
                        {isBondLoading ? (
                            <Skeleton width="80px" />
                        ) : (
                            new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                            }).format(bond.purchased)
                        )}
                    </p>
                </div>
                <Link component={NavLink} to={`/mints/${bond.name}`}>
                    <div className={classNames("bond-table-btn", { deprecated: bond.deprecated })}>
                        <p>{bond.v2Bond ? "Buy wMEMO" : `Mint ${bond.displayName}`}</p>
                    </div>
                </Link>
            </Paper>
        </Slide>
    );
}

export function BondTableData({ bond }: IBondProps) {
    const isBondLoading = bond.deprecated ? false : bond.bondPrice === undefined || bond.bondPrice === null;

    return (
        <TableRow>
            <TableCell align="left">
                <BondLogo bond={bond} />
                <div className="bond-name">
                    <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>{bond.displayName}</p>
                    {bond.isLP && (
                        <Link color="primary" href={bond.lpUrl} target="_blank">
                            <p className="bond-name-title">View Contract</p>
                        </Link>
                    )}
                </div>
            </TableCell>
            <TableCell align="center">
                <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>
                    <>
                        <span className="currency-icon">{priceUnits(bond)}</span> {isBondLoading ? <Skeleton width="50px" /> : trimPrice(bond.deprecated ? 0 : bond.bondPrice)}
                    </>
                </p>
            </TableCell>
            <TableCell align="right">
                <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>
                    {isBondLoading ? <Skeleton width="50px" /> : bond.soldOut ? "Sold out" : `${trim(bond.deprecated ? 0 : bond.bondDiscount * 100, 2)}%`}
                </p>
            </TableCell>
            <TableCell align="right">
                <p className={classNames("bond-name-title", { deprecated: bond.deprecated })}>
                    {isBondLoading ? (
                        <Skeleton width="50px" />
                    ) : (
                        new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                            minimumFractionDigits: 0,
                        }).format(bond.purchased)
                    )}
                </p>
            </TableCell>
            <TableCell>
                <Link component={NavLink} to={`/mints/${bond.name}`}>
                    <div className={classNames("bond-table-btn", { deprecated: bond.deprecated })}>
                        <p>{bond.v2Bond ? "Buy wMEMO" : "Mint"}</p>
                    </div>
                </Link>
            </TableCell>
        </TableRow>
    );
}

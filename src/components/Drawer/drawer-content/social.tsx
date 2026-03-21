import { SvgIcon, Link } from "@mui/material";
import GitHub from "../../../assets/icons/github.svg?react";
import Twitter from "../../../assets/icons/twitter.svg?react";
import Discord from "../../../assets/icons/discord.svg?react";

export default function Social() {
    return (
        <div className="social-row">
            <Link href="https://github.com/Wonderland-Money/wonderland-frontend" target="_blank">
                <SvgIcon color="primary" component={GitHub} />
            </Link>

            <Link href="https://twitter.com/wonderland_fi?s=21" target="_blank">
                <SvgIcon color="primary" component={Twitter} />
            </Link>

            <Link href="https://discord.gg/thDHseaHUt" target="_blank">
                <SvgIcon color="primary" component={Discord} />
            </Link>
        </div>
    );
}

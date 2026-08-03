import { SvgIcon, Link } from "@mui/material";
import Twitter from "../../../assets/icons/twitter.svg?react";
import Discord from "../../../assets/icons/discord.svg?react";

export default function Social() {
    return (
        <div className="social-row">
            <Link href="https://x.com/BetterBank_io" target="_blank" rel="noreferrer" aria-label="Pulsar on X">
                <SvgIcon color="primary" component={Twitter} />
            </Link>

            <Link href="https://discord.com/invite/jXG32pGbKJ" target="_blank" rel="noreferrer" aria-label="Pulsar Discord">
                <SvgIcon color="primary" component={Discord} />
            </Link>
        </div>
    );
}

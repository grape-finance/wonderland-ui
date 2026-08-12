import React, { useEffect, useState } from "react";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { loadTokenPrices } from "../helpers";
import Loading from "../components/Loader";

function Root() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTokenPrices().then(() => setLoading(false));
        const priceRefresh = window.setInterval(loadTokenPrices, 60_000);
        return () => window.clearInterval(priceRefresh);
    }, []);

    if (loading) return <Loading />;

    return (
        <HashRouter>
            <App />
        </HashRouter>
    );
}

export default Root;

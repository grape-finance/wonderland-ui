import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./loader.scss";

function Loader() {
    return (
        <div className="loader-wrap">
            <CircularProgress size={120} color="inherit" />
        </div>
    );
}

export default Loader;

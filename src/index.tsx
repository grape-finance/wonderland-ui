import { createRoot } from "react-dom/client";
import Root from "./Root";
import store from "./store/store";
import { Provider } from "react-redux";
import { Web3ContextProvider } from "./hooks";
import { SnackbarProvider } from "notistack";
import SnackMessage from "./components/Messages/snackbar";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiClient, chains } from "./wagmi.config";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
    palette: {
        mode: "dark",
    },
});

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={darkTheme()}>
                <SnackbarProvider
                    maxSnack={4}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    content={(key, message) => <SnackMessage id={key} message={JSON.parse(message as string)} />}
                    autoHideDuration={10000}
                >
                    <Provider store={store}>
                        <Web3ContextProvider>
                            <Root />
                        </Web3ContextProvider>
                    </Provider>
                </SnackbarProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    </ThemeProvider>,
);

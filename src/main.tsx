import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import "./style.css";

import { App } from "./App";
import { chains, client } from "./wagmi";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WagmiConfig client={client}>
    <RainbowKitProvider chains={chains} theme={darkTheme()}>
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
);

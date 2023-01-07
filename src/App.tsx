import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Account } from "./components";
import { BidForm } from "./components/BidForm";

export function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "10vh",
      }}
    >
      <h1>Pikapool React Demo</h1>
      <a
        href="https://pikapool.cool/docs"
        target="_blank"
        style={{ marginTop: "-15px", marginBottom: "2rem" }}
      >
        OwO whats this?
      </a>

      <BidForm />
    </div>
  );
}

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Account } from "./components";
import { BidForm } from "./components/BidForm";

export function App() {
  const { isConnected } = useAccount();
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

      <ConnectButton />
      {isConnected && <BidForm />}
    </div>
  );
}

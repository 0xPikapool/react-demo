import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { Account } from "./components";
import { BidForm } from "./components/BidForm";

export function App() {
  const { isConnected } = useAccount();
  return (
    <>
      <h1>Pikapool React Demo</h1>

      <ConnectButton />
      {isConnected && <BidForm />}
    </>
  );
}

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { providers } from "ethers";
import { useState } from "react";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { bids, types } from "@pikapool/sdk";
import happyPika from "../public/happy-pika.webp";
import sadPika from "../public/sad-pika.webp";

export function BidForm() {
  const signerResult = useSigner();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const [auctionAddress, setAuctionAddress] = useState<`0x${string}`>(
    "0x9bB4E845340a98cd132ce8e5B4C9fC0CedbB3C5b"
  );
  const [settlementContract, setSettlementContract] = useState<`0x${string}`>(
    "0xf2F1cb33141c931D2e81cD0572c97e5b2c63fD9c"
  );
  const [auctionName, setAuctionName] = useState<string>(
    "Bored_Pikachu_Pokeball_Club"
  );
  const signer = signerResult.data as providers.JsonRpcSigner | undefined;
  const [amount, setAmount] = useState(5);
  const [tip, setTip] = useState(0.1);
  const [basePrice, setBasePrice] = useState(0.15);
  const { signAndSubmit, isLoading, error, receipt, reset } = bids.hooks.useBid(
    auctionName,
    auctionAddress,
    basePrice,
    amount,
    tip,
    signer,
    {
      settlementContract,
    }
  );

  if (receipt) return <Success receipt={receipt} reset={reset} />;
  if (isLoading)
    return (
      <>
        <br />
        <br />
        <div className="pokeball">
          <div className="pokeball__button"></div>
        </div>
      </>
    );
  if (error) return <Error error={error} reset={reset} />;

  return (
    <>
      <ConnectButton />
      {isConnected && (
        <div style={{ display: "flex", gap: "3rem", marginTop: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3>Auction Configuration</h3>
            <label htmlFor="auctionName">Name</label>
            <input
              id="auctionName"
              type="text"
              value={auctionName}
              onChange={(e) => {
                setAuctionName(e.target.value);
              }}
            />
            <br />
            <label htmlFor="auctionAddress">NFT Address</label>
            <input
              id="auctionAddress"
              type="text"
              value={auctionAddress}
              onChange={(e) => {
                e.target.value.startsWith("0x") &&
                  setAuctionAddress(e.target.value as `0x${string}`);
              }}
            />
            <br />
            <label htmlFor="settlementContract">Settlement Address</label>
            <input
              id="settlementContract"
              type="text"
              value={settlementContract}
              onChange={(e) => {
                e.target.value.startsWith("0x") &&
                  setSettlementContract(e.target.value as `0x${string}`);
              }}
            />
            <br />
            <label htmlFor="basePrice">Base Price</label>
            <input
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3>Bid Configuration</h3>
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <br />
            <label htmlFor="tip">Tip</label>
            <input
              id="tip"
              type="number"
              value={tip}
              onChange={(e) => setTip(Number(e.target.value))}
            />
            <br />
            <br />
            <button
              style={{ alignSelf: "bottom" }}
              onClick={() => signAndSubmit()}
            >
              FIGHT ⚡
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function Success(props: {
  receipt: types.BidReceipt;
  reset: () => void;
}) {
  const receipt = props.receipt;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>⚡ Bid Submitted ⚡</h1>
      <div>
        <img style={{ maxHeight: "10rem" }} src={happyPika} />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            overflowWrap: "anywhere",
          }}
        >
          <div>
            <div>ID</div>
            <a
              href={`https://pikapool.cool/explorer?bid=${receipt.id}`}
              target="_blank"
            >
              {receipt.id}
            </a>
          </div>
          <div>
            <div>IPFS CID</div>
            <div>{receipt.cid}</div>
          </div>
        </div>
      </div>
      <br />
      <button onClick={props.reset}>Reset</button>
    </div>
  );
}

export function Error(props: { error: Error; reset: () => void }) {
  return (
    <>
      <h3>I'm having a major hat crisis</h3>{" "}
      <div>
        <img style={{ maxHeight: "10rem" }} src={sadPika} />{" "}
      </div>
      {props.error.message}
      <br />
      <br />
      <button onClick={props.reset}>Try again</button>
    </>
  );
}

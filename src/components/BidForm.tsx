import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import useBid, { Receipt } from "../hooks/useBid";
import happyPika from "../public/happy-pika.webp";
import sadPika from "../public/sad-pika.webp";

export function BidForm() {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const [auctionAddress, setAuctionAddress] = useState<`0x${string}`>(
    "0xFeebabE6b0418eC13b30aAdF129F5DcDd4f70CeA"
  );
  const [settlementContract, setSettlementContract] = useState<`0x${string}`>(
    "0xeb29126051fd8507f911b0506917e293bab82f8b"
  );
  const [auctionName, setAuctionName] = useState<string>(
    "LeafyGreens_Public_Sale"
  );
  const [amount, setAmount] = useState(5);
  const [tip, setTip] = useState(0.1);
  const [basePrice, setBasePrice] = useState(0.25);
  const { signAndSubmit, isLoading, error, receipt, reset } = useBid(
    auctionName,
    auctionAddress,
    amount,
    tip,
    basePrice,
    chain?.id,
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

export function Success(props: { receipt: Receipt; reset: () => void }) {
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

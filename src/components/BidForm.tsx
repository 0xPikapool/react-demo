import { useState } from "react";
import useBid from "../hooks/useBid";

export function BidForm() {
  const [auctionAddress, setAuctionAddress] = useState<`0x${string}`>(
    "0xFeebabE6b0418eC13b30aAdF129F5DcDd4f70CeA"
  );
  const [auctionName, setAuctionName] = useState<string>(
    "LeafyGreens_Public_Sale"
  );
  const [amount, setAmount] = useState(5);
  const [tip, setTip] = useState(0.1);
  const [basePrice, setBasePrice] = useState(0.25);
  const { signAndSubmit, isLoading, error, receipt } = useBid(
    auctionName,
    auctionAddress,
    amount,
    tip,
    basePrice
  );

  return (
    <>
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
          <label htmlFor="auctionAddress">Address</label>
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
          <label htmlFor="basePrice">Base Price</label>
          <input
            id="basePrice"
            type="text"
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
            Charge Meta-Transaction ⚡
          </button>
        </div>
      </div>
      <br />
      {error && <div>Error: {error.message}</div>}
      {isLoading && <div>Loading...</div>}
      {receipt && <div>Receipt: {receipt}</div>}
    </>
  );
}

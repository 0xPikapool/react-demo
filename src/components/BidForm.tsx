import { useState } from "react";
import useBid from "../hooks/useBid";

export function BidForm() {
  const [auctionName, setAuctionName] = useState("PokeNFT");
  const [auctionContract, setAuctionContract] =
    useState<`0x${string}`>("0x000");
  const [amount, setAmount] = useState(1);
  const [tip, setTip] = useState(0.1);
  const [basePrice, setBasePrice] = useState(0.25);
  const { signAndSubmit, isLoading, error, receipt } = useBid(
    auctionContract,
    amount,
    tip,
    basePrice
  );

  return (
    <>
      <div>
        <h3>Auction Configuration</h3>
        <label htmlFor="auctionContract">Auction Contract</label>
        <input
          id="auctionContract"
          type="text"
          value={auctionContract}
          onChange={(e) => {
            e.target.value.startsWith("0x") &&
              setAuctionContract(e.target.value as `0x${string}`);
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
        <h3>Bid Configuration</h3>
        <label htmlFor="amount">NFTs to bid for</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <br />
        <label htmlFor="tip">Tip (per nft)</label>
        <input
          id="tip"
          type="number"
          value={tip}
          onChange={(e) => setTip(Number(e.target.value))}
        />
        <br />
        <button onClick={() => signAndSubmit()}>Sign</button>
      </div>
      <br />
      {error && <div>Error: {error.message}</div>}
      {isLoading && <div>Loading...</div>}
      {receipt && <div>Receipt: {receipt}</div>}
    </>
  );
}

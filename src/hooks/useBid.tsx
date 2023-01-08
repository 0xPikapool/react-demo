import { useEffect, useState } from "react";
import { useSignTypedData, useAccount } from "wagmi";
import { BigNumber, utils, Contract, providers } from "ethers";

import SettlementAbi from "../abi/Settlement.json";

export interface Receipt {
  id: string;
  cid: string;
}

interface PikapoolOptions {
  settlementContract: `0x${string}`;
  rpcUrl: string;
}

interface PikapoolOptionOverrides {
  settlementContract?: `0x${string}`;
  rpcUrl?: string;
}

const DEFAULT_PIKAPOOL_OPTIONS: PikapoolOptions = {
  settlementContract: "0xd2090025857B9C7B24387741f120538E928A3a59",
  rpcUrl: "https://api.pikapool.cool/v0/bids",
};

export default function useBid(
  auctionName: string,
  auctionAddress: `0x${string}`,
  amount: number,
  tip: number,
  basePrice: number,
  chainId: number = 1,
  pikapoolOptionOverrides: PikapoolOptionOverrides = DEFAULT_PIKAPOOL_OPTIONS
) {
  const pikapoolOptions: PikapoolOptions = {
    ...DEFAULT_PIKAPOOL_OPTIONS,
    ...pikapoolOptionOverrides,
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const { address } = useAccount();

  const basePriceBn = BigNumber.from("69");
  const tipBn = BigNumber.from("420");

  const typedData = {
    primaryType: "Bid",
    domain: {
      name: "Pikapool Auction",
      version: "1",
      chainId: "0x" + chainId.toString(16),
      verifyingContract: pikapoolOptions.settlementContract,
    },

    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
      ],
      Bid: [
        { name: "auctionName", type: "string" },
        { name: "auctionAddress", type: "address" },
        { name: "bidder", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "basePrice", type: "uint256" },
        { name: "tip", type: "uint256" },
      ],
    },

    value: {
      auctionName,
      auctionAddress,
      bidder: address,
      amount: amount.toString(),
      basePrice: basePriceBn.toString(),
      tip: tipBn.toString(),
    },
  };
  const wagmi = useSignTypedData(typedData);

  // const provider = providers.getDefaultProvider(5);
  // const bid = {
  //   auctionName,
  //   auctionAddress,
  //   bidder: address,
  //   amount: amount.toString(),
  //   basePrice: basePriceBn.toString(),
  //   tip: tipBn.toString(),
  // };
  // console.log(bid);
  // const contract = new Contract(
  //   "0x6f6f38bfc46d3fe0e3a34c01d9550401c7764621",
  //   SettlementAbi,
  //   provider
  // );

  function reset() {
    setIsLoading(false);
    setError(null);
    setReceipt(null);
  }

  async function signAndSubmit() {
    if (!address) return setError(new Error("No address"));
    try {
      setIsLoading(true);
      setError(null);
      setReceipt(null);
      const sig = await wagmi.signTypedDataAsync();
      // wagmi uses 'value' instead of 'message' for some reason.
      // dirty switch for now.
      const typedDataToSend = {
        ...typedData,
        message: {
          ...typedData.value,
          amount: "0x" + amount.toString(16),
          basePrice: basePriceBn.toHexString(),
          tip: tipBn.toHexString(),
        },
      };
      // @ts-expect-error
      delete typedDataToSend["value"];
      console.log(
        JSON.stringify(
          {
            typed_data: typedDataToSend,
            signature: sig,
            sender: address,
          },
          null,
          2
        )
      );
      const res = await fetch(pikapoolOptions.rpcUrl, {
        method: "PUT",
        body: JSON.stringify(
          {
            typed_data: typedDataToSend,
            signature: sig,
            sender: address,
          },
          null,
          2
        ),
      });
      const receipt = await res.json();
      if (res.status !== 200)
        throw new Error(`[${res.status}] ${receipt.error}`);

      setReceipt(receipt);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        setReceipt(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signAndSubmit,
    isLoading,
    error,
    receipt,
    reset,
  };
}

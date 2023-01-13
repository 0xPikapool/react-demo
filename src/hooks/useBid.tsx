import { useState } from "react";
import { useAccount } from "wagmi";
import { utils, providers, Wallet } from "ethers";

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
  settlementContract: "0xf2F1cb33141c931D2e81cD0572c97e5b2c63fD9c",
  rpcUrl: "https://api.pikapool.cool/v0/bids",
};

export default function useBid(
  auctionName: string,
  auctionAddress: `0x${string}`,
  amount: number,
  tip: number,
  basePrice: number,
  signer: providers.JsonRpcSigner | Wallet | undefined,
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

  const basePriceBn = utils.parseEther(basePrice.toString());
  const tipBn = utils.parseEther(tip.toString());

  const typedData = {
    primaryType: "Bid",
    domain: {
      name: "Pikapool Auction",
      version: "1",
      chainId: "0x" + chainId.toString(16),
      verifyingContract: pikapoolOptions.settlementContract,
    },

    types: {
      Bid: [
        { name: "auctionName", type: "string" },
        { name: "auctionAddress", type: "address" },
        { name: "bidder", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "basePrice", type: "uint256" },
        { name: "tip", type: "uint256" },
      ],
    },

    message: {
      auctionName,
      auctionAddress,
      bidder: address,
      amount: "0x" + amount.toString(16),
      basePrice: basePriceBn.toHexString(),
      tip: tipBn.toHexString(),
    },
  };

  function reset() {
    setIsLoading(false);
    setError(null);
    setReceipt(null);
  }

  async function signAndSubmit() {
    if (!signer) return setError(new Error("No signer found"));
    if (!address) return setError(new Error("No address found"));
    try {
      setIsLoading(true);
      setError(null);
      setReceipt(null);
      const sig = await signer._signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
      );

      // Add the Domain to the types before sending to the server
      const typedDataToSend = {
        ...typedData,
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
          ...typedData.types,
        },
      };

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

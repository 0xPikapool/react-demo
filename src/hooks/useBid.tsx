import { useEffect, useState } from "react";
import { useSignTypedData, useSigner } from "wagmi";
import { utils } from "ethers";

type Receipt = string;

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
  rpcUrl: "https://3e4nlkrx8k.execute-api.us-east-1.amazonaws.com/bids",
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
  const { data: signer } = useSigner();

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
        { name: "amount", type: "uint256" },
        { name: "basePrice", type: "uint256" },
        { name: "tip", type: "uint256" },
      ],
    },

    value: {
      auctionName,
      auctionAddress,
      amount: amount.toString(),
      basePrice: basePriceBn.toString(),
      tip: tipBn.toString(),
    },
  };
  const res = useSignTypedData(typedData);

  async function signAndSubmit() {
    if (!signer) return setError(new Error("No signer detected"));
    try {
      setIsLoading(true);
      setError(null);
      setReceipt(null);
      const sig = await res.signTypedDataAsync();
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
      const receipt = await fetch(pikapoolOptions.rpcUrl, {
        method: "PUT",
        body: JSON.stringify(
          {
            typed_data: typedDataToSend,
            signature: sig,
            sender: await signer.getAddress(),
          },
          null,
          2
        ),
      }).then((res) => res.text());
      setReceipt(receipt);
      setError(null);
    } catch (error) {
      if (error instanceof Error) setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signAndSubmit,
    isLoading,
    error,
    receipt,
  };
}

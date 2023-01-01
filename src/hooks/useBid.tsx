import { useEffect, useState } from "react";
import { useSignTypedData, useSigner } from "wagmi";

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
  rpcUrl:
    // "https://akvasptk7wykstswut5q3r2rii0rnohr.lambda-url.us-east-1.on.aws/",
    "http://localhost:9000/lambda-url/pikapool-api/",
};

export default function useBid(
  auctionContract: `0x${string}`,
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
        { name: "auctionContract", type: "address" },
        { name: "nftCount", type: "string" },
        { name: "basePricePerNft", type: "string" },
        { name: "tipPerNft", type: "string" },
      ],
    },

    value: {
      auctionContract: auctionContract,
      nftCount: amount.toString(),
      basePricePerNft: basePrice.toString(),
      tipPerNft: tip.toString(),
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
      const typedDataToSend = { ...typedData, message: typedData.value };
      // @ts-expect-error
      delete typedDataToSend["value"];
      const receipt = await fetch(pikapoolOptions.rpcUrl, {
        method: "PUT",
        body: JSON.stringify(
          {
            typedData: typedDataToSend,
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

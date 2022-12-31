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
  settlementContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  rpcUrl:
    // "https://akvasptk7wykstswut5q3r2rii0rnohr.lambda-url.us-east-1.on.aws/",
    "http://localhost:9000/lambda-url/pikapool-api/",
};

export default function useBid(
  auctionContract: `0x${string}`,
  amount: number,
  tip: number,
  basePrice: number = 23,
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
      name: `Pikapool Auction`,
      version: "1",
      chainId: "0x1",
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
      const sig = await res.signTypedDataAsync();
      // wagmi uses 'value' instead of 'message' for some reason.
      // dirty switch for now.
      const typed_data = { ...typedData, message: typedData.value };
      // @ts-expect-error
      delete typed_data["value"];
      console.log(sig);
      const receipt = JSON.stringify(
        await (
          await fetch(pikapoolOptions.rpcUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              typed_data,
              signature: sig,
              sender: await signer.getAddress(),
            }),
          })
        ).json(),
        null,
        2
      ) as Receipt;
      setReceipt(receipt);
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

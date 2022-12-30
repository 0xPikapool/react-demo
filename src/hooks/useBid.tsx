import { useEffect, useState } from "react";
import { useSignTypedData } from "wagmi";

// interface Receipt {
//   timestamp_iso: string;
//   signer: `0x${string}`;
//   domain: {
//     name: `${string} - Bid Confirmation`;
//     version: "1";
//     chainId: 1;
//     verifyingContract: `0x${string}`;
//   };
//   bid: {
//     "auction contract": string;
//     "total nfts": number;
//     "base price (per nft)": number;
//     "tip (per nft)": number;
//   };
//   signer_signature: string;
//   pikapool_signature: string;
// }

type Receipt = string;

interface PikapoolOptions {
  settlementContract?: `0x${string}`;
  rpcUrl?: string;
}

const DEFAULT_PIKAPOOL_OPTIONS: PikapoolOptions = {
  settlementContract: "0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990",
  rpcUrl:
    "https://akvasptk7wykstswut5q3r2rii0rnohr.lambda-url.us-east-1.on.aws/",
};

export default function useBid(
  auctionName: string,
  auctionContract: `0x${string}`,
  amount: number,
  tip: number,
  basePrice: number = 23,
  pikapoolOptionOverrides: PikapoolOptions = DEFAULT_PIKAPOOL_OPTIONS
) {
  const pikapoolOptions = {
    pikapoolOptionOverrides,
    ...DEFAULT_PIKAPOOL_OPTIONS,
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const typedData = {
    domain: {
      name: `${auctionName} - Bid Confirmation`,
      version: "1",
      chainId: 1,
      verifyingContract: pikapoolOptions.settlementContract,
    },

    types: {
      Bid: [
        { name: "auction contract", type: "string" },
        { name: "nfts to bid for", type: "string" },
        { name: "base price (per nft)", type: "string" },
        { name: "tip (per nft)", type: "string" },
      ],
    },

    value: {
      "auction contract": auctionContract,
      "nfts to bid for": amount.toString(),
      "base price (per nft)": basePrice.toString(),
      "tip (per nft)": tip.toString(),
    },
  };
  const res = useSignTypedData(typedData);

  async function signAndSubmit() {
    try {
      setIsLoading(true);
      setError(null);
      const sig = await res.signTypedDataAsync();
      console.log(sig);
      // Mock RPC request
      const receipt = (await new Promise((resolve) =>
        setTimeout(() => resolve("receipt"), 1000)
      )) as Receipt;
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

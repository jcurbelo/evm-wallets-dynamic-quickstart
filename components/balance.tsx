"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDynamicConnector } from "@/hooks/useDynamicConnector";
import { formatUnits } from "viem";
import { type Balances, type Chain } from "@crossmint/wallets-sdk";

export function WalletBalance() {
  const { crossmintWallet } = useDynamicConnector();
  const [balances, setBalances] = useState<Balances>();

  useEffect(() => {
    async function fetchBalances() {
      if (!crossmintWallet) return;
      try {
        const balances = await crossmintWallet.balances(
          ["eth", "usdc"],
          [process.env.NEXT_PUBLIC_CHAIN as Chain]
        );
        setBalances(balances);
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
        alert("Error fetching wallet balances: " + error);
      }
    }
    fetchBalances();
  }, [crossmintWallet]);

  const formatBalance = (balance: string, decimals: number) => {
    return formatUnits(BigInt(balance), decimals);
  };

  const ethBalance = balances?.nativeToken?.rawAmount || "0";
  const usdcBalance = balances?.usdc?.rawAmount || "0";

  const ethDecimals = balances?.nativeToken?.decimals || 18;
  const usdcDecimals = balances?.usdc?.decimals || 6;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/eth.svg" alt="Ethereum" width={14} height={14} />
          <p className="font-medium">Ethereum</p>
        </div>
        <div className="text-gray-700 font-medium">
          {formatBalance(ethBalance, ethDecimals)} ETH
        </div>
      </div>
      <div className="border-t my-1"></div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
          <p className="font-medium">USDC</p>
        </div>
        <div className="text-gray-700 font-medium">
          $ {formatBalance(usdcBalance, usdcDecimals)}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <a
          href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          + Get free test ETH
        </a>
        <a
          href="https://faucet.circle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          + Get free test USDC
        </a>
      </div>
      <div className="text-gray-500 text-xs">
        Refresh the page after topping up. Balance may take a few seconds to
        update.
      </div>
    </div>
  );
}

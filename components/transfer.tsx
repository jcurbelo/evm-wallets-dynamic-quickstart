"use client";

import { useDynamicConnector } from "@/hooks/useDynamicConnector";
import { useState } from "react";
import { Address, encodeFunctionData, erc20Abi, isAddress } from "viem";

export function TransferFunds() {
  const { crossmintWallet } = useDynamicConnector();
  const [token, setToken] = useState<"eth" | "usdc" | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);

  async function handleOnTransfer() {
    if (!crossmintWallet || !token || !recipient || !amount) {
      alert("Transfer: missing required fields");
      return;
    }

    // Validate EVM recipient address
    if (!isAddress(recipient)) {
      alert("Transfer: Invalid recipient address");
      return;
    }

    try {
      setIsLoading(true);
      let txn;
      if (token === "eth") {
        // For ETH transfers, we use native transfer
        txn = await crossmintWallet.sendTransaction({
          to: recipient as Address,
          value: BigInt(amount * 10 ** 9), // Convert to Gwei
          data: "0x", // Empty data for native transfers
          chain: crossmintWallet.chain,
        });
      } else if (token === "usdc") {
        // For USDC transfers, we use ERC20 transfer
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient as Address, BigInt(amount * 10 ** 6)], // USDC has 6 decimals
        });
        txn = await crossmintWallet.sendTransaction({
          to: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // USDC token mint on OP sepolia
          value: BigInt(0),
          data,
          chain: crossmintWallet.chain,
        });
      }
      setTxnHash(`https://optimism-sepolia.blockscout.com/tx/${txn}`);
    } catch (err) {
      console.error("Transfer: ", err);
      alert("Transfer: " + err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-lg font-medium">Transfer funds</h2>
        <p className="text-sm text-gray-500">Send funds to another wallet</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium">Token</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="token"
                  className="h-4 w-4"
                  checked={token === "eth"}
                  onChange={() => setToken("eth")}
                />
                <span>ETH</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="token"
                  className="h-4 w-4"
                  checked={token === "usdc"}
                  onChange={() => setToken("usdc")}
                />
                <span>USDC</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="0.00"
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Recipient wallet</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Enter wallet address"
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isLoading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent/80"
          }`}
          onClick={handleOnTransfer}
          disabled={isLoading}
        >
          {isLoading ? "Transferring..." : "Transfer"}
        </button>
        {txnHash && !isLoading && (
          <a
            href={txnHash}
            className="text-sm text-gray-500 text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            → View on Explorer (refresh to update balance)
          </a>
        )}
      </div>
    </div>
  );
}

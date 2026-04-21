"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { isMiniPay, CHAIN } from "@/lib/config";
import { injected } from "wagmi/connectors";
import { formatEther } from "viem";

export default function WalletBar() {
  const { address, isConnected } = useAccount();
  const { connect }              = useConnect();
  const { disconnect }           = useDisconnect();
  const { data: balance }        = useBalance({ address, chainId: CHAIN.id });
  const [miniPay, setMiniPay]    = useState(false);

  // Auto-connect in MiniPay
  useEffect(() => {
    const mp = isMiniPay();
    setMiniPay(mp);
    if (mp && !isConnected) {
      connect({ connector: injected() });
    }
  }, []);

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  if (!isConnected) {
    // Hide wallet connect entirely if inside MiniPay (it auto-connects)
    if (miniPay) return null;

    return (
      <div className="flex justify-center py-2">
        <button
          onClick={() => connect({ connector: injected() })}
          className="btn-primary font-display font-bold px-6 py-3 rounded-xl text-white text-sm"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between glass-card rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-celo-green to-celo-purple flex items-center justify-center">
          <span className="text-xs">👤</span>
        </div>
        <div>
          <p className="font-mono text-xs text-gray-400">
            {miniPay ? "MiniPay" : "Wallet"}
          </p>
          <p className="font-mono text-sm text-white font-medium">
            {shortAddress(address!)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-mono text-xs text-gray-400">Balance</p>
          <p className="font-mono text-sm font-bold text-celo-green">
            {balance ? `${parseFloat(formatEther(balance.value)).toFixed(3)} CELO` : "—"}
          </p>
        </div>
        {/* Don't show disconnect in MiniPay */}
        {!miniPay && (
          <button
            onClick={() => disconnect()}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg border border-celo-border"
          >
            Exit
          </button>
        )}
      </div>
    </div>
  );
}

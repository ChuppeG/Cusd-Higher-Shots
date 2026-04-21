"use client";

import { useState } from "react";
import WalletBar from "@/components/WalletBar";
import GameBoard from "@/components/GameBoard";
import Leaderboard from "@/components/Leaderboard";

export default function Home() {
  const [tab, setTab] = useState<"game" | "leaderboard">("game");

  return (
    <main className="relative z-10 min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col gap-4">

      {/* Header */}
      <div className="text-center pt-2 pb-1">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          <span className="text-white">CELO</span>{" "}
          <span className="text-celo-green">HIGH</span>{" "}
          <span className="text-white">SHOT</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1 font-mono">
          Alfajores Testnet
        </p>
      </div>

      {/* Wallet bar */}
      <WalletBar />

      {/* Tab switcher */}
      <div className="glass-card rounded-2xl p-1 flex gap-1">
        {(["game", "leaderboard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-display font-semibold text-sm transition-all capitalize ${
              tab === t
                ? "bg-celo-green text-celo-dark shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t === "game" ? "🎯 Play" : "🏆 Leaders"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {tab === "game" ? <GameBoard /> : <Leaderboard />}
      </div>

      {/* Footer */}
      <div className="text-center pb-2">
        <p className="text-gray-600 text-xs font-mono">
          Built on Celo · Powered by smart contracts
        </p>
      </div>

    </main>
  );
}

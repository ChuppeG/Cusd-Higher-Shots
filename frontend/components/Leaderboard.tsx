"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN } from "@/lib/config";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getLeaderboard",
    chainId: CHAIN.id,
  });

  const entries = (data as Array<{ player: string; score: bigint }> | undefined) ?? [];
  const active = entries.filter((e) => e.player !== "0x0000000000000000000000000000000000000000");

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">🏆</span>
        <h2 className="font-display text-xl font-bold text-white">Leaderboard</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500 font-mono text-sm animate-pulse">
          Loading…
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No scores yet.</p>
          <p className="text-gray-600 text-xs mt-1">Be the first to play!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((entry, i) => (
            <div
              key={entry.player}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                i === 0
                  ? "bg-gradient-to-r from-yellow-900/30 to-transparent border-yellow-500/30"
                  : "bg-celo-card border-celo-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6 text-center">
                  {MEDALS[i] ?? `${i + 1}`}
                </span>
                <span className="font-mono text-sm text-gray-300">
                  {shortAddress(entry.player)}
                </span>
              </div>
              <span className="font-display font-bold text-lg text-celo-green">
                {entry.score.toString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN } from "@/lib/config";

type GamePhase = "idle" | "starting" | "playing" | "result" | "gameover";

interface RoundResult {
  correct: boolean;
  prevNumber: number;
  newNumber: number;
  guessedHigher: boolean;
}

export default function GameBoard() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [phase, setPhase]           = useState<GamePhase>("idle");
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [score, setScore]           = useState<number>(0);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [animKey, setAnimKey]       = useState(0);
  const [pendingGuess, setPendingGuess] = useState<boolean | null>(null);
  const [txStatus, setTxStatus]     = useState("");

  // ── Read on-chain session ──────────────────────────────────────────────────
  const { data: sessionData, refetch: refetchSession } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getSession",
    args: [address!],
    chainId: CHAIN.id,
    query: { enabled: !!address },
  });

  // Sync state from chain on load
  useEffect(() => {
    if (!sessionData) return;
    const [active, num, sc] = sessionData as [boolean, number, number, bigint];
    if (active) {
      setPhase("playing");
      setCurrentNumber(Number(num));
      setScore(Number(sc));
    }
  }, [sessionData]);

  // ── Contract writes ────────────────────────────────────────────────────────
  const { writeContractAsync } = useWriteContract();

  const startSession = useCallback(async () => {
    if (!isConnected) return;
    setPhase("starting");
    setTxStatus("Confirm 0.5 CELO entry fee in your wallet…");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "startSession",
        value: parseEther("0.5"),
        chainId: CHAIN.id,
      });
      setTxStatus("Transaction submitted, waiting…");
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });

      // Parse SessionStarted event to get first number
      const event = receipt.logs.find((log) => {
        try {
          // topic[0] = keccak256("SessionStarted(address,uint8)")
          return log.topics[0] ===
            "0x" + /* we'll just refetch */ "";
        } catch { return false; }
      });

      await refetchSession();
      setTxStatus("");
    } catch (e: any) {
      setTxStatus("Transaction failed: " + (e?.shortMessage || e?.message || "unknown"));
      setPhase("idle");
      setTimeout(() => setTxStatus(""), 4000);
    }
  }, [isConnected, writeContractAsync, publicClient, refetchSession]);

  const playRound = useCallback(async (guessHigher: boolean) => {
    if (phase !== "playing") return;
    setPendingGuess(guessHigher);
    setTxStatus("Confirm 0.01 CELO round fee…");

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "playRound",
        args: [guessHigher],
        value: parseEther("0.01"),
        chainId: CHAIN.id,
      });
      setTxStatus("Revealing number…");
      await publicClient!.waitForTransactionReceipt({ hash });

      const { data: newSession } = await refetchSession();
      if (!newSession) return;

      const [active, newNum, newScore] = newSession as [boolean, number, number, bigint];
      const prev = currentNumber;

      const correct =
        (guessHigher && Number(newNum) > prev) ||
        (!guessHigher && Number(newNum) < prev);

      setLastResult({
        correct,
        prevNumber: prev,
        newNumber: Number(newNum),
        guessedHigher: guessHigher,
      });

      setCurrentNumber(Number(newNum));
      setScore(Number(newScore));
      setAnimKey((k) => k + 1);
      setPendingGuess(null);
      setTxStatus("");

      if (!active) {
        setPhase("gameover");
      } else {
        setPhase("result");
        setTimeout(() => setPhase("playing"), 1800);
      }
    } catch (e: any) {
      setTxStatus("Error: " + (e?.shortMessage || e?.message || "unknown"));
      setPendingGuess(null);
      setTimeout(() => setTxStatus(""), 4000);
    }
  }, [phase, currentNumber, writeContractAsync, publicClient, refetchSession]);

  const endSession = useCallback(async () => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "endSession",
        chainId: CHAIN.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchSession();
      setPhase("gameover");
    } catch (e) {}
  }, [writeContractAsync, publicClient, refetchSession]);

  const resetGame = () => {
    setPhase("idle");
    setScore(0);
    setCurrentNumber(0);
    setLastResult(null);
  };

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Connect to Play
        </h2>
        <p className="text-gray-400 text-sm">
          Connect your wallet above to start playing Celo High Shot
        </p>
      </div>
    );
  }

  // ── IDLE — Start screen ───────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="glass-card rounded-3xl p-8 text-center space-y-6">
        <div>
          <div className="text-6xl mb-3">🎯</div>
          <h2 className="font-display text-3xl font-extrabold text-white">
            Celo High Shot
          </h2>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Guess if the next number is <span className="text-celo-green font-semibold">HIGHER</span> or{" "}
            <span className="text-celo-purple font-semibold">LOWER</span>.<br />
            Each correct guess wins you <span className="text-celo-yellow font-semibold">0.015 CELO</span>. One wrong guess ends your session!
          </p>
        </div>

        {/* Fee info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-celo-card rounded-2xl p-4 border border-celo-border">
            <p className="text-gray-400 text-xs mb-1">Entry Fee</p>
            <p className="font-display font-bold text-xl text-celo-yellow">0.5 CELO</p>
            <p className="text-gray-500 text-xs mt-1">one-time per session</p>
          </div>
          <div className="bg-celo-card rounded-2xl p-4 border border-celo-border">
            <p className="text-gray-400 text-xs mb-1">Per Round</p>
            <p className="font-display font-bold text-xl text-celo-green">0.01 CELO</p>
            <p className="text-gray-500 text-xs mt-1">+ win 0.015 CELO back</p>
          </div>
        </div>

        {txStatus && (
          <p className="text-celo-yellow text-sm font-mono animate-pulse">{txStatus}</p>
        )}

        <button
          onClick={startSession}
          disabled={phase === "starting"}
          className="btn-primary w-full py-4 rounded-2xl font-display font-bold text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {phase === "starting" ? "Starting…" : "🚀 Start Session (0.5 CELO)"}
        </button>
      </div>
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div className="glass-card rounded-3xl p-8 text-center space-y-6 animate-slide-up">
        <div className="text-6xl">
          {score >= 10 ? "🏆" : score >= 5 ? "🥈" : "💀"}
        </div>
        <div>
          <h2 className="font-display text-3xl font-extrabold text-white">
            {score >= 10 ? "Legendary!" : score >= 5 ? "Nice Run!" : "Game Over!"}
          </h2>
          <p className="text-gray-400 mt-2">Your session has ended</p>
        </div>
        <div className="bg-celo-card rounded-2xl p-6 border border-celo-border">
          <p className="text-gray-400 text-sm mb-1">Final Score</p>
          <p className="number-display text-6xl">{score}</p>
          <p className="text-gray-500 text-xs mt-2">
            {score > 0
              ? `You earned ${(score * 0.015).toFixed(3)} CELO in rewards!`
              : "Better luck next time!"}
          </p>
        </div>
        <button
          onClick={resetGame}
          className="btn-primary w-full py-4 rounded-2xl font-display font-bold text-lg text-white"
        >
          🔄 Play Again
        </button>
      </div>
    );
  }

  // ── PLAYING / RESULT ──────────────────────────────────────────────────────
  const isLoading = pendingGuess !== null;
  const showResult = phase === "result" && lastResult;

  return (
    <div className="space-y-4">
      {/* Score bar */}
      <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs">Score</p>
          <p className="font-display font-extrabold text-2xl text-celo-green">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs">Streak</p>
          <p className="font-display font-bold text-xl text-celo-yellow">
            {"🔥".repeat(Math.min(score, 5))} {score === 0 ? "—" : ""}
          </p>
        </div>
        <button
          onClick={endSession}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-celo-border px-3 py-2 rounded-xl"
        >
          End Session
        </button>
      </div>

      {/* Main number display */}
      <div className={`glass-card rounded-3xl p-8 text-center ${showResult ? (lastResult.correct ? "glow-green" : "glow-red") : "animate-pulse-glow"}`}>
        {showResult && (
          <div className={`text-sm font-bold mb-3 ${lastResult.correct ? "text-celo-green" : "text-red-400"} animate-slide-up`}>
            {lastResult.correct ? "✅ Correct! +" : "❌ Wrong! —"}
            {lastResult.correct ? " 0.015 CELO" : " Round ends"}
          </div>
        )}

        <p className="text-gray-400 text-sm mb-2 font-mono">Current Number</p>
        <div key={animKey} className="number-display text-8xl leading-none animate-number-pop">
          {currentNumber}
        </div>
        <p className="text-gray-500 text-xs mt-3 font-mono">out of 100</p>
      </div>

      {/* Guess buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => playRound(true)}
          disabled={isLoading || phase === "result"}
          className="btn-higher text-white font-display font-bold text-xl py-6 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <span className="text-3xl">↑</span>
          <span>HIGHER</span>
          <span className="text-xs font-normal opacity-75">0.01 CELO</span>
        </button>
        <button
          onClick={() => playRound(false)}
          disabled={isLoading || phase === "result"}
          className="btn-lower text-white font-display font-bold text-xl py-6 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <span className="text-3xl">↓</span>
          <span>LOWER</span>
          <span className="text-xs font-normal opacity-75">0.01 CELO</span>
        </button>
      </div>

      {/* TX status */}
      {(isLoading || txStatus) && (
        <div className="glass-card rounded-2xl px-4 py-3 text-center">
          <p className="text-celo-yellow text-sm font-mono animate-pulse">
            {txStatus || "Processing transaction…"}
          </p>
        </div>
      )}
    </div>
  );
}

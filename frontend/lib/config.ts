import { createConfig, http } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

// ── MiniPay Detection ─────────────────────────────────────────────────────────
// MiniPay injects window.ethereum with isMiniPay = true
export const isMiniPay = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window as any).ethereum?.isMiniPay;
};

// ── Chain config ──────────────────────────────────────────────────────────────
export const CHAIN =
  process.env.NEXT_PUBLIC_CHAIN_ID === "42220" ? celo : celoAlfajores;

export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// ── Wagmi Config ──────────────────────────────────────────────────────────────
export const wagmiConfig = createConfig({
  chains: [celoAlfajores, celo],
  connectors: [
    injected(), // Covers MiniPay (injected) + MetaMask + others
    metaMask(),
  ],
  transports: {
    [celoAlfajores.id]: http("https://alfajores-forno.celo-testnet.org"),
    [celo.id]:          http("https://forno.celo.org"),
  },
});

// ── Contract ABI ──────────────────────────────────────────────────────────────
export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "startSession",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "guessHigher", type: "bool" }],
    name: "playRound",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "endSession",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getSession",
    outputs: [
      { internalType: "bool",    name: "active",        type: "bool"    },
      { internalType: "uint8",   name: "currentNumber", type: "uint8"   },
      { internalType: "uint32",  name: "score",         type: "uint32"  },
      { internalType: "uint256", name: "startedAt",     type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLeaderboard",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint32",  name: "score",  type: "uint32"  },
        ],
        internalType: "struct CeloHighShot.LeaderEntry[10]",
        name: "",
        type: "tuple[10]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ENTRY_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROUND_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WIN_REWARD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "address", name: "player",      type: "address" },
      { indexed: false, internalType: "uint8",   name: "firstNumber", type: "uint8"   },
    ],
    name: "SessionStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "address", name: "player",        type: "address" },
      { indexed: false, internalType: "bool",    name: "guessedHigher", type: "bool"    },
      { indexed: false, internalType: "uint8",   name: "prevNumber",    type: "uint8"   },
      { indexed: false, internalType: "uint8",   name: "newNumber",     type: "uint8"   },
      { indexed: false, internalType: "bool",    name: "correct",       type: "bool"    },
      { indexed: false, internalType: "uint32",  name: "score",         type: "uint32"  },
    ],
    name: "RoundPlayed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "address", name: "player",     type: "address" },
      { indexed: false, internalType: "uint32",  name: "finalScore", type: "uint32"  },
    ],
    name: "SessionEnded",
    type: "event",
  },
] as const;

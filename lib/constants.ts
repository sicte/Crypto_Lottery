import { Chain, defineChain } from "viem";

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  1: defineChain({
    id: 1,
    name: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://eth.llamarpc.com"] } },
    blockExplorers: { default: { name: "Etherscan", url: "https://etherscan.io" } },
  }),
  56: defineChain({
    id: 56,
    name: "BSC",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: { default: { http: ["https://bsc-dataseed.bnbchain.org"] } },
    blockExplorers: { default: { name: "BscScan", url: "https://bscscan.com" } },
  }),
  137: defineChain({
    id: 137,
    name: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: { default: { http: ["https://polygon-rpc.com"] } },
    blockExplorers: { default: { name: "PolygonScan", url: "https://polygonscan.com" } },
  }),
  728126428: defineChain({
    id: 728126428,
    name: "TRON",
    nativeCurrency: { name: "TRX", symbol: "TRX", decimals: 6 },
    rpcUrls: { default: { http: ["https://api.trongrid.io/jsonrpc"] } },
    blockExplorers: { default: { name: "Tronscan", url: "https://tronscan.org" } },
  }),
};

export const DEFAULT_CHAIN_ID = 728126428;

function getEnvAddress(key: string, fallback: string): `0x${string}` {
  if (typeof window !== "undefined") {
    return (process.env[`NEXT_PUBLIC_${key}`] || fallback) as `0x${string}`;
  }
  return fallback as `0x${string}`;
}

export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  728126428: getEnvAddress("CONTRACT_ADDRESS_TRON", "0x0000000000000000000000000000000000000000"),
  56: getEnvAddress("CONTRACT_ADDRESS_BSC", "0x0000000000000000000000000000000000000000"),
  137: getEnvAddress("CONTRACT_ADDRESS_POLYGON", "0x0000000000000000000000000000000000000000"),
  1: getEnvAddress("CONTRACT_ADDRESS_ETH", "0x0000000000000000000000000000000000000000"),
};

export const USDT_ADDRESSES: Record<number, `0x${string}`> = {
  728126428: getEnvAddress("USDT_ADDRESS_TRON", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
  56: getEnvAddress("USDT_ADDRESS_BSC", "0x55d398326f99059fF775485246999027B3197955"),
  137: getEnvAddress("USDT_ADDRESS_POLYGON", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
  1: getEnvAddress("USDT_ADDRESS_ETH", "0xdAC17F958D2ee523a2206206994597C13D831ec7"),
};

export const GAME_CONSTANTS = {
  TICKET_COST: BigInt(2000000),
  MAX_TICKETS: 30,
  PRIZE_1ST: BigInt(25000000),
  PRIZE_2ND: BigInt(10000000),
  PRIZE_3RD: BigInt(2500000),
  PLATFORM_FEE: BigInt(5000000),
  TIMEOUT_SECONDS: 24 * 60 * 60,
  NUM_WINNERS: 7,
} as const;

export function getContractAddress(chainId: number): `0x${string}` {
  return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];
}

export function getUSDTAddress(chainId: number): `0x${string}` {
  return USDT_ADDRESSES[chainId] || USDT_ADDRESSES[DEFAULT_CHAIN_ID];
}

export function formatUSDT(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amount / divisor;
  const frac = amount % divisor;
  if (frac === BigInt(0)) return whole.toString();
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getPhaseLabel(phase: number): string {
  const labels = ["ACTIVE", "DRAWN", "FINALIZED", "REFUNDED"];
  return labels[phase] || "UNKNOWN";
}

export function getPrizeInfo(ticketIndex: number, winningTickets: number[]): {
  rank: string;
  amount: string;
  claimed: boolean;
} | null {
  const position = winningTickets.indexOf(ticketIndex);
  if (position === -1) return null;

  if (position === 0) return { rank: "1st", amount: "25 USDT", claimed: false };
  if (position <= 2) return { rank: "2nd", amount: "10 USDT", claimed: false };
  return { rank: "3rd", amount: "2.5 USDT", claimed: false };
}
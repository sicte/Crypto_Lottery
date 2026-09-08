"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from "@/lib/constants";

export const wagmiConfig = createConfig({
  chains: [
    SUPPORTED_CHAINS[1],
    SUPPORTED_CHAINS[56],
    SUPPORTED_CHAINS[137],
    SUPPORTED_CHAINS[728126428],
  ],
  connectors: [
    injected({ target: "metaMask" }),
    injected({ target: "coinbaseWallet" }),
    injected({ target: "rainbow" }),
    injected({ target: "braveWallet" }),
  ],
  transports: {
    [1]: http("https://eth.llamarpc.com"),
    [56]: http("https://bsc-dataseed.bnbchain.org"),
    [137]: http("https://polygon-rpc.com"),
    [728126428]: http("https://api.trongrid.io/jsonrpc"),
  },
  ssr: true,
});

export function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS[chainId]?.name || `Chain ${chainId}`;
}

export function getExplorerUrl(chainId: number, hash: string): string {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain?.blockExplorers?.default?.url) return "";
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}
"use client";

import { useAccount, useConnect, useConnectors } from "wagmi";
import { Wallet, CheckCircle, X, ChevronDown } from "lucide-react";
import { useState } from "react";

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const configuredConnectors = useConnectors();
  const { connect, connectors: connectConnectors, isPending } = useConnect();
  const [showModal, setShowModal] = useState(false);

  // Combine connectors
  const allConnectors = Array.from(
    new Map([
      ...configuredConnectors.map(c => [c.id, c] as const),
      ...connectConnectors.map(c => [c.id, c] as const)
    ]).values()
  );

  const handleConnect = (connectorId: string) => {
    const connector = allConnectors.find(c => c.id === connectorId);
    if (connector) {
      connect({ connector });
      setShowModal(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-800 border border-neon-green/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-neon-green" />
          <span className="font-mono text-sm text-neon-green">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        {chain && (
          <span className="px-2 py-1 text-xs font-mono bg-neon-green/10 text-neon-green border border-neon-green/30 rounded">
            {chain.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="btn-arcade flex items-center gap-2"
        style={{ minWidth: "160px" }}
      >
        <Wallet className="w-4 h-4" />
        <span>{isPending ? "Connecting..." : "Connect Wallet"}</span>
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="arcade-card w-full max-w-md p-6 animate-float">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-lg neon-text">CONNECT WALLET</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-500 hover:text-neon-green">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {allConnectors.length === 0 ? (
                <div className="text-center text-surface-500 py-8">
                  <p className="mb-2">No wallets detected</p>
                  <p className="text-xs">Install MetaMask, TronLink, or another Web3 wallet</p>
                </div>
              ) : (
                allConnectors.map(connector => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector.id)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 p-3 bg-surface-700 border border-surface-600 rounded-lg hover:bg-neon-green/10 hover:border-neon-green/30 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-neon-green" />
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-sm text-white">{connector.name}</div>
                      <div className="text-xs text-surface-500">{connector.id}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-surface-500" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
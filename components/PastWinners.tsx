"use client";

import { Trophy, Clock, Hash } from "lucide-react";
import { useEffect, useState } from "react";

interface PastWinnersProps {
  contractAddress: string;
  chainId: number;
}

interface WinnerEntry {
  round: number;
  ticketIndex: number;
  winner: string;
  prize: string;
  timestamp: number;
}

export function PastWinners({ contractAddress, chainId }: PastWinnersProps) {
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch from event logs or a subgraph
    // For now, we'll generate mock data based on the contract address
    const mockWinners: WinnerEntry[] = Array.from({ length: 10 }, (_, i) => {
      const round = 10 - i;
      const ticketIndices = Array.from({ length: 7 }, (_, j) => Math.floor(Math.random() * 30));
      const prizes = ["25 USDT", "10 USDT", "10 USDT", "2.5 USDT", "2.5 USDT", "2.5 USDT", "2.5 USDT"];
      
      return ticketIndices.map((ticketIdx, j) => ({
        round,
        ticketIndex: ticketIdx,
        winner: `0x${Math.random().toString(16).slice(2, 42).padStart(40, "0")}`,
        prize: prizes[j],
        timestamp: Date.now() - (i * 86400000) - (j * 3600000),
      }));
    }).flat();

    setWinners(mockWinners);
    setIsLoading(false);
  }, [contractAddress, chainId]);

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="arcade-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-neon-yellow" />
          <h3 className="font-mono text-lg font-bold neon-text" style={{ textShadow: "0 0 10px #ffe500" }}>
            RECENT WINNERS
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-surface-700/50 rounded-lg animate-pulse border border-surface-600" />
          ))}
        </div>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="arcade-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-neon-yellow" />
          <h3 className="font-mono text-lg font-bold neon-text" style={{ textShadow: "0 0 10px #ffe500" }}>
            RECENT WINNERS
          </h3>
        </div>
        <div className="text-center py-8 text-surface-500">
          No winners yet. Be the first!
        </div>
      </div>
    );
  }

  return (
    <div className="arcade-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-neon-yellow" />
          <h3 className="font-mono text-lg font-bold neon-text" style={{ textShadow: "0 0 10px #ffe500" }}>
            RECENT WINNERS
          </h3>
        </div>
        <span className="text-xs text-surface-500">{winners.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-600">
              <th className="text-left pb-2 font-mono text-xs text-surface-500 uppercase tracking-wider">ROUND</th>
              <th className="text-left pb-2 font-mono text-xs text-surface-500 uppercase tracking-wider">TICKET</th>
              <th className="text-left pb-2 font-mono text-xs text-surface-500 uppercase tracking-wider">WINNER</th>
              <th className="text-left pb-2 font-mono text-xs text-surface-500 uppercase tracking-wider">PRIZE</th>
              <th className="text-left pb-2 font-mono text-xs text-surface-500 uppercase tracking-wider">TIME</th>
            </tr>
          </thead>
          <tbody>
            {winners.slice(0, 15).map((entry, i) => (
              <tr
                key={`${entry.round}-${entry.ticketIndex}`}
                className={`border-b border-surface-700/50 hover:bg-surface-700/50 transition-colors ${
                  i < 7 ? "bg-neon-yellow/5" : ""
                }`}
              >
                <td className="py-3 font-mono text-neon-yellow">#{entry.round}</td>
                <td className="py-3 font-mono text-neon-green">#{entry.ticketIndex}</td>
                <td className="py-3 font-mono text-surface-300">{formatAddress(entry.winner)}</td>
                <td className="py-3 font-mono text-neon-pink">{entry.prize}</td>
                <td className="py-3 text-surface-500">{formatTime(entry.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Marquee of recent winning tickets */}
      <div className="mt-4 p-3 bg-surface-700/50 rounded-lg border border-surface-600 overflow-hidden">
        <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
          <Hash className="w-3 h-3" />
          <span className="font-mono">RECENT WINNING TICKETS</span>
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-4">
          {winners.slice(0, 20).map((entry, i) => (
            <span
              key={`${entry.round}-${entry.ticketIndex}`}
              className="flex items-center gap-1 font-mono text-neon-green white-space-nowrap"
            >
              <Trophy className="w-3 h-3" />
              R{entry.round}·T{entry.ticketIndex}→{entry.prize}
            </span>
          ))}
          {winners.slice(0, 20).map((entry, i) => (
            <span
              key={`${entry.round}-${entry.ticketIndex}-dup`}
              className="flex items-center gap-1 font-mono text-neon-green white-space-nowrap"
            >
              <Trophy className="w-3 h-3" />
              R{entry.round}·T{entry.ticketIndex}→{entry.prize}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
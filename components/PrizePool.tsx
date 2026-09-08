"use client";

import { Trophy, Medal, Award, Gem } from "lucide-react";

interface PrizePoolProps {
  phase: number;
  winningTickets: number[];
  userTickets: number[];
}

const PRIZES = [
  { rank: "1ST PLACE", count: 1, amount: "25 USDT", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", labelColor: "text-yellow-400" },
  { rank: "2ND PLACE", count: 2, amount: "10 USDT each", icon: Medal, color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/30", labelColor: "text-gray-300" },
  { rank: "3RD PLACE", count: 4, amount: "2.5 USDT each", icon: Award, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30", labelColor: "text-orange-400" },
];

export function PrizePool({ phase, winningTickets, userTickets }: PrizePoolProps) {
  const isDrawn = phase >= 1;

  return (
    <div className="arcade-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-neon-yellow" />
          <h3 className="font-mono text-lg font-bold neon-text" style={{ textShadow: "0 0 10px #ffe500" }}>
            PRIZE POOL
          </h3>
        </div>
        <span className="text-xs font-mono text-neon-yellow">60 USDT TOTAL</span>
      </div>

      <div className="space-y-3">
        {PRIZES.map((prize, idx) => {
          const Icon = prize.icon;
          const winners = winningTickets.slice(
            PRIZES.slice(0, idx).reduce((sum, p) => sum + p.count, 0),
            PRIZES.slice(0, idx + 1).reduce((sum, p) => sum + p.count, 0)
          );

          const userWon = winners.some(w => userTickets.includes(w));
          const userWinningTicket = userTickets.find(t => winners.includes(t));

          return (
            <div
              key={prize.rank}
              className={`p-4 rounded-lg border transition-all ${
                prize.bg
              } ${userWon ? "ring-2 ring-neon-green animate-pulse-glow" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${prize.color}`} />
                  <div>
                    <div className="font-mono text-sm font-bold">{prize.rank}</div>
                    <div className="text-xs text-surface-500">{prize.count} Winner{prize.count > 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold {prize.labelColor}">{prize.amount}</div>
                  {isDrawn && (
                    <div className="text-xs text-surface-500">
                      {winners.map(w => `#${w}`).join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {isDrawn && winners.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {winners.map((ticketIdx, i) => (
                    <span
                      key={ticketIdx}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        userTickets.includes(ticketIdx)
                          ? "bg-neon-green text-surface-900 border-neon-green"
                          : "bg-surface-700 text-surface-400 border-surface-600"
                      }`}
                    >
                      #{ticketIdx}
                      {userTickets.includes(ticketIdx) && (
                        <span className="ml-1 text-neon-green">← YOU</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {!isDrawn && (
                <div className="text-center text-surface-500 text-sm py-2">
                  Winners revealed after draw
                </div>
              )}

              {userWon && userWinningTicket !== undefined && (
                <div className="mt-2 p-2 bg-neon-green/10 border border-neon-green/30 rounded text-center">
                  <span className="font-mono text-sm text-neon-green">
                    🎉 YOU WON {prize.amount} WITH TICKET #{userWinningTicket}!
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Platform Fee */}
        <div className="p-4 rounded-lg border bg-neon-pink/10 border-neon-pink/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gem className="w-6 h-6 text-neon-pink" />
              <div>
                <div className="font-mono text-sm font-bold text-neon-pink">PLATFORM FEE</div>
                <div className="text-xs text-surface-500">Owner commission</div>
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-neon-pink">5 USDT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
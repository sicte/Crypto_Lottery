"use client";

import { Ticket, Target } from "lucide-react";

interface ProgressBarProps {
  totalSold: number;
  maxTickets: number;
  phase: number;
}

export function ProgressBar({ totalSold, maxTickets, phase }: ProgressBarProps) {
  const percentage = (totalSold / maxTickets) * 100;
  const isFull = totalSold >= maxTickets;
  const isActive = phase === 0;

  return (
    <div className="arcade-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-neon-green" />
          <h3 className="font-mono text-lg font-bold neon-text">ROUND PROGRESS</h3>
        </div>
        <span className="ticket-count text-2xl font-bold text-neon-green">
          {totalSold} / {maxTickets}
        </span>
      </div>

      <div className="progress-track relative">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {isFull && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-pulse text-neon-green font-mono font-bold text-sm">
              FULL - DRAW EXECUTING
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-surface-600">0 Tickets</span>
        <span className="text-surface-600">{maxTickets} Tickets</span>
      </div>

      {isActive && totalSold > 0 && totalSold < maxTickets && (
        <div className="mt-4 flex items-center gap-2 text-neon-yellow text-sm">
          <Target className="w-4 h-4" />
          <span>{maxTickets - totalSold} tickets until auto-draw</span>
        </div>
      )}

      {phase === 1 && (
        <div className="mt-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 text-neon-green font-mono">
            <span className="relative">
              <span className="absolute -top-2 -right-2 w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            </span>
            DRAW EXECUTED - Winners selected!
          </div>
        </div>
      )}

      {phase === 2 && (
        <div className="mt-4 p-3 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
          <div className="flex items-center gap-2 text-neon-blue font-mono">
            ROUND FINALIZED - Ready for next round
          </div>
        </div>
      )}

      {phase === 3 && (
        <div className="mt-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
          <div className="flex items-center gap-2 text-neon-pink font-mono">
            REFUNDED - Round expired, tickets refunded
          </div>
        </div>
      )}
    </div>
  );
}
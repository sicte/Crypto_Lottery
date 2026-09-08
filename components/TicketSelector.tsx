"use client";

import { Plus, Minus, Calculator, Zap, Wallet } from "lucide-react";
import { useState, useMemo } from "react";

interface TicketSelectorProps {
  maxTickets: number;
  totalSold: number;
  ticketCost: string;
  onBuy: (count: number) => void;
  disabled?: boolean;
  userBalance?: string;
  userTickets?: number[];
  isConnected: boolean;
}

export function TicketSelector({
  maxTickets,
  totalSold,
  ticketCost,
  onBuy,
  disabled,
  userBalance,
  userTickets = [],
  isConnected,
}: TicketSelectorProps) {
  const [count, setCount] = useState(1);
  const remaining = maxTickets - totalSold;
  const maxAvailable = Math.min(remaining, maxTickets);

  const totalCost = useMemo(() => {
    const cost = parseFloat(ticketCost) * count;
    return cost.toFixed(2);
  }, [ticketCost, count]);

  const winProbability = useMemo(() => {
    if (maxTickets === 0) return 0;
    return ((count / maxTickets) * 100).toFixed(1);
  }, [count, maxTickets]);

  const userTicketCount = userTickets.length;
  const isDisabled = disabled || !isConnected;

  const handleIncrement = () => {
    if (count < maxAvailable) setCount(c => c + 1);
  };

  const handleDecrement = () => {
    if (count > 1) setCount(c => c - 1);
  };

  const handleMax = () => {
    setCount(maxAvailable);
  };

  return (
    <div className="arcade-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-neon-pink" />
          <h3 className="font-mono text-lg font-bold neon-text-pink">TICKET SELECTOR</h3>
        </div>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-surface-700/50 border border-neon-pink/20 rounded-lg text-center">
          <Wallet className="w-8 h-8 mx-auto text-neon-pink/50 mb-2" />
          <p className="text-surface-500 text-sm mb-2">Connect your wallet to purchase tickets</p>
        </div>
      )}

      {/* Ticket Counter */}
      <div className="flex items-center justify-center gap-6 mb-6 opacity-{isDisabled ? 50 : 100}">
        <button
          onClick={handleIncrement}
          disabled={count <= 1 || isDisabled || remaining === 0}
          className="btn-arcade w-14 h-14 flex items-center justify-center text-2xl"
          aria-label="Decrease tickets"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="ticket-count text-5xl font-bold text-neon-pink">{count}</div>
          <div className="text-xs text-surface-600 uppercase tracking-wider">TICKETS</div>
        </div>

        <button
          onClick={handleIncrement}
          disabled={count >= maxAvailable || isDisabled || remaining === 0}
          className="btn-arcade w-14 h-14 flex items-center justify-center text-2xl"
          aria-label="Increase tickets"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2 justify-center mb-6 flex-wrap opacity-{isDisabled ? 50 : 100}">
        {[1, 2, 3, 5, maxAvailable].filter((v, i, arr) => arr.indexOf(v) === i && v <= maxAvailable).map(n => (
          <button
            key={n}
            onClick={() => setCount(n)}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
              count === n
                ? "bg-neon-pink text-surface-900 border-neon-pink"
                : "bg-surface-700 text-neon-pink border-neon-pink/30 hover:bg-neon-pink/10"
            }`}
          >
            {n === maxAvailable ? "MAX" : `${n}`}
          </button>
        ))}
      </div>

      {/* Cost & Probability */}
      <div className="grid grid-cols-2 gap-4 mb-6 opacity-{isDisabled ? 50 : 100}">
        <div className="bg-surface-700 p-4 rounded-lg border border-neon-pink/20">
          <div className="flex items-center gap-2 text-xs text-surface-600 mb-1">
            <Zap className="w-3 h-3" />
            TOTAL COST
          </div>
          <div className="font-mono text-2xl font-bold text-neon-pink">{totalCost} USDT</div>
        </div>

        <div className="bg-surface-700 p-4 rounded-lg border border-neon-pink/20">
          <div className="flex items-center gap-2 text-xs text-surface-600 mb-1">
            <Zap className="w-3 h-3" />
            WIN PROBABILITY
          </div>
          <div className="font-mono text-2xl font-bold text-neon-green">{winProbability}%</div>
        </div>
      </div>

      {/* User tickets */}
      {userTicketCount > 0 && (
        <div className="mb-4 p-3 bg-surface-700 border border-neon-green/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-neon-green mb-1">
            Your tickets this round: <strong className="font-mono">{userTicketCount}</strong>
          </div>
          <div className="flex flex-wrap gap-1">
            {userTickets.map(t => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs font-mono bg-neon-green/10 text-neon-green border border-neon-green/30 rounded"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Balance check */}
      {userBalance && (
        <div className="mb-4 p-3 bg-surface-700 border border-neon-blue/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-neon-blue">
            Your USDT Balance: <strong className="font-mono">{parseFloat(userBalance).toFixed(2)} USDT</strong>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <button
        onClick={() => onBuy(count)}
        disabled={isDisabled || count === 0 || remaining === 0}
        className={`btn-arcade w-full py-4 text-lg animate-float ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isConnected
          ? `BUY ${count} TICKET${count > 1 ? "S" : ""} FOR ${totalCost} USDT`
          : "CONNECT WALLET TO BUY"}
      </button>

      {remaining === 0 && (
        <p className="text-center text-surface-600 text-sm mt-3">
          Round is full! Waiting for draw...
        </p>
      )}
    </div>
  );
}
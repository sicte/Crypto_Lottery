"use client";

import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  timeUntilTimeout: number;
  phase: number;
  roundStartTime: number;
}

export function CountdownTimer({ timeUntilTimeout, phase, roundStartTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeUntilTimeout);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setTimeLeft(timeUntilTimeout);
    setIsWarning(timeUntilTimeout > 0 && timeUntilTimeout <= 3600); // Warning under 1 hour
  }, [timeUntilTimeout]);

  useEffect(() => {
    if (timeLeft <= 0 || phase !== 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 3600 && prev > 3600) setIsWarning(true);
        if (newTime <= 0) setIsWarning(false);
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (phase !== 0) {
    const labels = {
      1: { label: "DRAW EXECUTED", icon: CheckCircle, color: "text-neon-green" },
      2: { label: "ROUND FINALIZED", icon: CheckCircle, color: "text-neon-blue" },
      3: { label: "REFUND COMPLETE", icon: AlertCircle, color: "text-neon-pink" },
    };
    const current = labels[phase as keyof typeof labels] || labels[1];
    const Icon = current.icon;

    return (
      <div className="arcade-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-blue" />
            <h3 className="font-mono text-lg font-bold neon-text-blue">ROUND STATUS</h3>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 p-4 bg-surface-700 rounded-lg border border-neon-blue/30">
          <Icon className={`w-8 h-8 ${current.color} animate-pulse`} />
          <span className="font-mono text-xl font-bold {current.color}">{current.label}</span>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;

  return (
    <div className="arcade-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 {isWarning ? 'text-neon-orange animate-pulse' : 'text-neon-blue'}" />
          <h3 className="font-mono text-lg font-bold neon-text-blue">REFUND COUNTDOWN</h3>
        </div>
        {isWarning && (
          <AlertCircle className="w-5 h-5 text-neon-orange animate-pulse" />
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {formatTime(timeLeft).split(":").map((part, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`font-mono text-4xl font-bold tabular-nums transition-colors ${
                isWarning ? "text-neon-orange" : "text-neon-blue"
              } ${isExpired ? "text-neon-pink" : ""}`}
            >
              {part}
            </div>
            <div className="text-xs text-surface-600 uppercase tracking-wider">
              {["HOURS", "MINS", "SECS"][i]}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        {isExpired ? (
          <div className="flex items-center justify-center gap-2 text-neon-pink font-mono">
            <AlertCircle className="w-4 h-4" />
            TIME EXPIRED - Refund available
          </div>
        ) : isWarning ? (
          <div className="flex items-center justify-center gap-2 text-neon-orange font-mono animate-pulse">
            <AlertCircle className="w-4 h-4" />
            LESS THAN 1 HOUR REMAINING
          </div>
        ) : (
          <div className="text-surface-500 text-sm font-mono">
            Refund available after 24 hours if round doesn't fill
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-surface-700 rounded-lg border border-surface-600">
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>Round started:</span>
          <span className="font-mono">
            {new Date(roundStartTime * 1000).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-surface-500 mt-1">
          <span>Deadline:</span>
          <span className="font-mono">
            {new Date((roundStartTime + 86400) * 1000).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useLottery } from "@/lib/hooks";
import { WalletConnect } from "./WalletConnect";
import { ProgressBar } from "./ProgressBar";
import { TicketSelector } from "./TicketSelector";
import { PrizePool } from "./PrizePool";
import { CountdownTimer } from "./CountdownTimer";
import { PastWinners } from "./PastWinners";
import { AlertTriangle, Info, RefreshCw, Wallet } from "lucide-react";
import { useState } from "react";

export function LotteryPage() {
  const {
    // State
    isConnected,
    address,
    chainId,
    targetChainId,
    contractAddress,
    usdtAddress,
    isWrongChain,
    totalSold,
    roundNumber,
    phase,
    winningTickets,
    timeUntilTimeout,
    userTickets,
    userBalance,
    allowance,
    // Actions
    approveUSDT,
    buyTickets,
    claimPrize,
    withdrawPlatformFee,
    refund,
    advanceRound,
    switchChain,
    // TX states
    isLotteryPending,
    isUSDTPending,
    isLotteryConfirming,
    isUSDTConfirming,
  } = useLottery();

  const [showClaimModal, setShowClaimModal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const remainingTickets = 30 - totalSold;
  const canBuy = isConnected && !isWrongChain && phase === 0 && remainingTickets > 0;
  const needsApproval = allowance < BigInt(2000000) * BigInt(Math.max(1, remainingTickets));

  const handleBuy = async (count: number) => {
    setError(null);
    setSuccess(null);
    try {
      if (needsApproval) {
        await approveUSDT(BigInt(2000000) * BigInt(count));
        // Wait a bit for approval to be mined
        await new Promise(r => setTimeout(r, 2000));
      }
      await buyTickets(count);
      setSuccess(`Successfully purchased ${count} ticket${count > 1 ? "s" : ""}!`);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    }
  };

  const handleClaim = async (ticketIndex: number) => {
    setError(null);
    setSuccess(null);
    try {
      await claimPrize(ticketIndex);
      setSuccess("Prize claimed successfully!");
      setShowClaimModal(null);
    } catch (err: any) {
      setError(err.message || "Claim failed");
    }
  };

  const handleWithdrawFee = async () => {
    setError(null);
    setSuccess(null);
    try {
      await withdrawPlatformFee();
      setSuccess("Platform fee withdrawn!");
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    }
  };

  const handleRefund = async () => {
    setError(null);
    setSuccess(null);
    try {
      await refund();
      setSuccess("Refund processed!");
    } catch (err: any) {
      setError(err.message || "Refund failed");
    }
  };

  const handleAdvance = async () => {
    setError(null);
    setSuccess(null);
    try {
      await advanceRound();
      setSuccess("New round started!");
    } catch (err: any) {
      setError(err.message || "Failed to advance round");
    }
  };

  // Check for claimable prizes
  const claimableTickets = winningTickets.filter(t => 
    userTickets.includes(t) && !winningTickets.includes(t) // This check is redundant, need to check _claimed
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
              <span className="font-mono font-bold text-surface-900 text-lg">L</span>
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold neon-text">CRYPTO LOTTERY</h1>
              <p className="text-xs text-surface-500 font-mono">30 Tickets · 7 Winners · 60 USDT Pool</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnect />
            {isWrongChain && (
              <button
                onClick={() => switchChain({ chainId: targetChainId })}
                className="btn-arcade btn-pink text-sm px-4"
              >
                Switch to {targetChainId === 728126428 ? "TRON" : "Network"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notifications */}
      {(error || success) && (
        <div className="max-w-6xl mx-auto px-4 py-2 animate-slide-down">
          {error && (
            <div className="bg-neon-pink/10 border border-neon-pink/30 text-neon-pink p-3 rounded-lg flex items-center gap-2 font-mono text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-neon-pink hover:text-surface-900">×</button>
            </div>
          )}
          {success && (
            <div className="bg-neon-green/10 border border-neon-green/30 text-neon-green p-3 rounded-lg flex items-center gap-2 font-mono text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto text-neon-green hover:text-surface-900">×</button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Timer */}
          <div className="lg:col-span-1 space-y-6">
            <ProgressBar
              totalSold={totalSold}
              maxTickets={30}
              phase={phase}
            />

            <CountdownTimer
              timeUntilTimeout={timeUntilTimeout}
              phase={phase}
              roundStartTime={roundNumber > 0 ? Math.floor(Date.now() / 1000) - (86400 - timeUntilTimeout) : 0}
            />

            {/* Round Info */}
            <div className="arcade-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-sm text-neon-blue">ROUND INFO</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-surface-500">Round</div>
                  <div className="font-mono text-lg text-neon-green">#{roundNumber}</div>
                </div>
                <div>
                  <div className="text-surface-500">Phase</div>
                  <div className="font-mono text-lg capitalize">
                    {["ACTIVE", "DRAWN", "FINALIZED", "REFUNDED"][phase] || "UNKNOWN"}
                  </div>
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="arcade-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-sm text-neon-pink">NETWORK</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Chain ID</span>
                <span className="font-mono text-neon-pink">{chainId}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-surface-500">Contract</span>
                <span className="font-mono text-xs text-neon-pink truncate max-w-[150px]">
                  {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-surface-500">USDT</span>
                <span className="font-mono text-xs text-neon-pink truncate max-w-[150px]">
                  {usdtAddress.slice(0, 8)}...{usdtAddress.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Center Column - Ticket Selector & Prize Pool */}
          <div className="lg:col-span-1 space-y-6">
            <TicketSelector
              maxTickets={30}
              totalSold={totalSold}
              ticketCost="2"
              onBuy={handleBuy}
              disabled={!canBuy || isLotteryPending || isUSDTPending || isLotteryConfirming || isUSDTConfirming}
              userBalance={userBalance ? (Number(userBalance) / 1e6).toFixed(2) : undefined}
              userTickets={userTickets}
              isConnected={isConnected}
            />

            <PrizePool
              phase={phase}
              winningTickets={winningTickets}
              userTickets={userTickets}
            />

            {/* Action Buttons for Drawn/Finalized phases */}
            {(phase === 1 || phase === 2) && (
              <div className="arcade-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-mono text-neon-pink">
                  ROUND ACTIONS
                </div>
                {phase === 1 && address && (
                  <button
                    onClick={handleWithdrawFee}
                    disabled={isLotteryPending || isLotteryConfirming || !isConnected}
                    className={`btn-arcade btn-pink w-full py-3 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isConnected ? "WITHDRAW PLATFORM FEE (5 USDT)" : "CONNECT WALLET TO WITHDRAW"}
                  </button>
                )}
                {phase === 2 && (
                  <button
                    onClick={handleAdvance}
                    disabled={isLotteryPending || isLotteryConfirming || !isConnected}
                    className={`btn-arcade w-full py-3 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isConnected ? "START NEXT ROUND" : "CONNECT WALLET TO CONTINUE"}
                  </button>
                )}
                {Number(phase) === 3 && (
                  <button
                    onClick={handleAdvance}
                    disabled={isLotteryPending || isLotteryConfirming || !isConnected}
                    className={`btn-arcade w-full py-3 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isConnected ? "START NEXT ROUND" : "CONNECT WALLET TO CONTINUE"}
                  </button>
                )}
              </div>
            )}

            {/* Refund Button */}
            {phase === 0 && timeUntilTimeout === 0 && totalSold > 0 && totalSold < 30 && (
              <div className="arcade-card p-4">
                <div className="flex items-center gap-2 text-sm font-mono text-neon-orange mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  REFUND AVAILABLE
                </div>
                <button
                  onClick={handleRefund}
                  disabled={isLotteryPending || isLotteryConfirming || !isConnected}
                  className={`btn-arcade btn-pink w-full py-3 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isConnected ? `CLAIM REFUND (${totalSold * 2} USDT)` : "CONNECT WALLET TO CLAIM REFUND"}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Past Winners */}
          <div className="lg:col-span-1">
            <PastWinners
              contractAddress={contractAddress}
              chainId={chainId}
            />
          </div>
        </div>

        {/* Claim Modal */}
        {showClaimModal !== null && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="arcade-card w-full max-w-md p-6 animate-float">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-lg neon-text">CLAIM PRIZE</h3>
                <button onClick={() => setShowClaimModal(null)} className="text-surface-500 hover:text-neon-green">×</button>
              </div>
              {!isConnected ? (
                <div className="text-center mb-6">
                  <div className="text-surface-500 mb-4">Connect your wallet to claim your prize</div>
                  <WalletConnect />
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="font-mono text-4xl text-neon-green mb-2">#{showClaimModal}</div>
                    <div className="text-surface-500">Winning Ticket</div>
                  </div>
                  <button
                    onClick={() => handleClaim(showClaimModal)}
                    disabled={isLotteryPending || isLotteryConfirming}
                    className="btn-arcade w-full py-4"
                  >
                    CLAIM PRIZE
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {(isLotteryPending || isUSDTPending || isLotteryConfirming || isUSDTConfirming) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="arcade-card p-8 text-center max-w-sm">
              <RefreshCw className="w-10 h-10 text-neon-green animate-spin mx-auto mb-4" />
              <p className="font-mono text-neon-green mb-2">
                {isUSDTPending || isUSDTConfirming ? "Approving USDT..." : "Processing Transaction..."}
              </p>
              <p className="text-surface-500 text-sm">Please confirm in your wallet</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-700 bg-surface-900/50 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-surface-500 font-mono">
          Decentralized USDT Lottery · Smart Contract Verified · Built on EVM/TRON
        </div>
      </footer>
    </div>
  );
}
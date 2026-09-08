"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useEffect, useState, useCallback } from "react";

import { LOTTERY_ABI, USDT_ABI } from "@/lib/contracts";
import { getContractAddress, getUSDTAddress, formatUSDT, DEFAULT_CHAIN_ID, SUPPORTED_CHAINS, GAME_CONSTANTS } from "@/lib/constants";

export function useLottery() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const targetChainId = SUPPORTED_CHAINS[chainId] ? chainId : DEFAULT_CHAIN_ID;
  const contractAddress = getContractAddress(targetChainId);
  const usdtAddress = getUSDTAddress(targetChainId);

  const [lotteryData, setLotteryData] = useState({
    totalSold: 0,
    roundNumber: 0,
    roundStartTime: 0,
    phase: 0,
    winningTickets: [] as number[],
    timeUntilTimeout: 0,
    userTickets: [] as number[],
    userBalance: BigInt(0),
    allowance: BigInt(0),
  });

  const { writeContract: writeLottery, data: lotteryTxHash, isPending: isLotteryPending } = useWriteContract();
  const { writeContract: writeUSDT, data: usdtTxHash, isPending: isUSDTPending } = useWriteContract();
  const { isLoading: isLotteryConfirming } = useWaitForTransactionReceipt({ hash: lotteryTxHash });
  const { isLoading: isUSDTConfirming } = useWaitForTransactionReceipt({ hash: usdtTxHash });

  // Read contract state
  const { data: totalSold } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "totalSold",
    query: { enabled: isConnected && contractAddress !== "0x0000000000000000000000000000000000000000" },
  });

  const { data: roundNumber } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "roundNumber",
    query: { enabled: isConnected },
  });

  const { data: roundStartTime } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "roundStartTime",
    query: { enabled: isConnected },
  });

  const { data: phase } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "phase",
    query: { enabled: isConnected },
  });

  const { data: timeUntilTimeout } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "timeUntilTimeout",
    query: { enabled: isConnected, refetchInterval: 1000 },
  });

  // Read winning tickets
  const { data: winningTickets0 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(0)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  const { data: winningTickets1 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(1)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  const { data: winningTickets2 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(2)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  const { data: winningTickets3 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(3)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  const { data: winningTickets4 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(4)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  const { data: winningTickets5 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(5)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  const { data: winningTickets6 } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "winningTickets",
    args: [BigInt(6)],
    query: { enabled: isConnected && (phase === 1 || phase === 2) },
  });

  // User tickets
  const { data: userTickets } = useReadContract({
    address: contractAddress,
    abi: LOTTERY_ABI,
    functionName: "getUserTickets",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  // USDT balance and allowance
  const { data: userBalance } = useReadContract({
    address: usdtAddress,
    abi: USDT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && usdtAddress !== "0x0000000000000000000000000000000000000000" },
  });

  const { data: allowance } = useReadContract({
    address: usdtAddress,
    abi: USDT_ABI,
    functionName: "allowance",
    args: address && contractAddress !== "0x0000000000000000000000000000000000000000" ? [address, contractAddress] : undefined,
    query: { enabled: isConnected && !!address && contractAddress !== "0x0000000000000000000000000000000000000000" },
  });

  // Update local state
  useEffect(() => {
    setLotteryData(prev => ({
      ...prev,
      totalSold: Number(totalSold || 0),
      roundNumber: Number(roundNumber || 0),
      roundStartTime: Number(roundStartTime || 0),
      phase: Number(phase || 0),
      timeUntilTimeout: Number(timeUntilTimeout || 0),
      userTickets: userTickets ? userTickets.map(Number) : [],
      userBalance: userBalance || BigInt(0),
      allowance: allowance || BigInt(0),
      winningTickets: [
        Number(winningTickets0 || 0),
        Number(winningTickets1 || 0),
        Number(winningTickets2 || 0),
        Number(winningTickets3 || 0),
        Number(winningTickets4 || 0),
        Number(winningTickets5 || 0),
        Number(winningTickets6 || 0),
      ].filter(t => t !== 0),
    }));
  }, [totalSold, roundNumber, roundStartTime, phase, timeUntilTimeout, userTickets, userBalance, allowance, winningTickets0, winningTickets1, winningTickets2, winningTickets3, winningTickets4, winningTickets5, winningTickets6]);

  // Actions
  const approveUSDT = useCallback(async (amount: bigint = parseUnits("1000", 6)) => {
    if (!usdtAddress || usdtAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("USDT address not configured");
    }
    writeUSDT({
      address: usdtAddress,
      abi: USDT_ABI,
      functionName: "approve",
      args: [contractAddress, amount],
    });
  }, [writeUSDT, usdtAddress, contractAddress]);

  const buyTicket = useCallback(async () => {
    writeLottery({
      address: contractAddress,
      abi: LOTTERY_ABI,
      functionName: "buyTicket",
    });
  }, [writeLottery, contractAddress]);

  const buyTickets = useCallback(async (count: number) => {
    writeLottery({
      address: contractAddress,
      abi: LOTTERY_ABI,
      functionName: "buyTickets",
      args: [BigInt(count)],
    });
  }, [writeLottery, contractAddress]);

  const claimPrize = useCallback(async (ticketIndex: number) => {
    writeLottery({
      address: contractAddress,
      abi: LOTTERY_ABI,
      functionName: "claimPrize",
      args: [BigInt(ticketIndex)],
    });
  }, [writeLottery, contractAddress]);

  const withdrawPlatformFee = useCallback(async () => {
    writeLottery({
      address: contractAddress,
      abi: LOTTERY_ABI,
      functionName: "withdrawPlatformFee",
    });
  }, [writeLottery, contractAddress]);

  const refund = useCallback(async () => {
    writeLottery({
      address: contractAddress,
      abi: LOTTERY_ABI,
      functionName: "refund",
    });
  }, [writeLottery, contractAddress]);

  const advanceRound = useCallback(async () => {
    writeLottery({
      address: contractAddress,
      abi: LOTTERY_ABI,
      functionName: "advanceRound",
    });
  }, [writeLottery, contractAddress]);

  const isWrongChain = chainId !== targetChainId && isConnected;

  return {
    // State
    ...lotteryData,
    isConnected,
    address,
    chainId,
    targetChainId,
    contractAddress,
    usdtAddress,
    isWrongChain,
    // Actions
    approveUSDT,
    buyTicket,
    buyTickets,
    claimPrize,
    withdrawPlatformFee,
    refund,
    advanceRound,
    switchChain,
    // Transaction states
    isLotteryPending,
    isUSDTPending,
    isLotteryConfirming,
    isUSDTConfirming,
    lotteryTxHash,
    usdtTxHash,
  };
}
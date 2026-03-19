"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Clock, Users, ArrowRightLeft, History, Loader2, Sparkles } from "lucide-react";
import { getCurrentPrizePool, getPrizeHistory, enterPrizePool, drawPrizeWinner } from "@/actions/prize-pool";
import { useToastActions } from "@/components/ui/Toast";
import { useDeposit } from "@yo-protocol/react";
import { VAULTS, parseTokenAmount } from "@yo-protocol/core";
import { useAccount, useSwitchChain } from "wagmi";

export function PrizePoolPage() {
  const queryClient = useQueryClient();
  const { toast } = useToastActions();
  const [depositAmount, setDepositAmount] = useState("");
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const { data: pool } = useQuery({
    queryKey: ["prize-pool", "current"],
    queryFn: () => getCurrentPrizePool(),
  });

  const { data: history = [] } = useQuery({
    queryKey: ["prize-pool", "history"],
    queryFn: () => getPrizeHistory(),
  });

  const enterMutation = useMutation({
    mutationFn: () => enterPrizePool(Number(depositAmount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prize-pool"] });
      setDepositAmount("");
      toast({
        type: "success",
        title: "Entered Prize Pool!",
        message: "Your principal is deposited. Good luck in the draw!",
      });
    },
    onError: (e: Error) => {
      toast({
        type: "error",
        title: "Entry Failed",
        message: e.message,
      });
    }
  });

  const { deposit, isLoading: isDepositing, step: depositStep } = useDeposit({
    vault: VAULTS.yoUSD.address,
    onConfirmed: () => {
      // Once on-chain deposit is confirmed, register the entry in DB
      enterMutation.mutate();
    },
  });

  const handleDeposit = async () => {
    if (!address) {
      toast({ type: "error", title: "Wallet not connected", message: "Please connect your wallet first." });
      return;
    }
    if (chainId !== 8453) {
      switchChain({ chainId: 8453 });
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) return;

    try {
      const amountRaw = parseTokenAmount(depositAmount, 6);
      await deposit({
        token: VAULTS.yoUSD.underlying.address[8453]!,
        amount: amountRaw
      });
    } catch (e) {
      toast({
        type: "error",
        title: "Deposit Failed",
        message: String(e),
      });
    }
  };

  const drawMutation = useMutation({
    mutationFn: () => drawPrizeWinner(),
    onSuccess: (data: { winner: string; jackpot: number }) => {
      queryClient.invalidateQueries({ queryKey: ["prize-pool"] });
      toast({
        type: "success",
        title: "Draw Complete!",
        message: `Winner: ${data.winner.slice(0,6)}... Won $${data.jackpot.toFixed(2)}!`,
      });
    },
    onError: (e: Error) => {
      toast({
        type: "error",
        title: "Draw Failed",
        message: e.message,
      });
    }
  });

  const [now, setNow] = useState<number>(() => Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000 * 60 * 60); // update every hour
    return () => clearInterval(timer);
  }, []);

  const timeUntilDraw = pool ? new Date(pool.drawStartsAt).getTime() - now : 0;
  const daysLeft = Math.max(0, Math.floor(timeUntilDraw / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-deep-slate flex items-center gap-3">
            <Trophy className="w-8 h-8 text-terracotta" /> Prize Pool
          </h1>
          <p className="text-deep-slate/60 mt-3 max-w-2xl">
            A no-loss lottery powered by pooled yield. Deposit principal to enter. The principal remains yours to withdraw anytime, but the generated yield is pooled into a weekly jackpot won by a single participant.
          </p>
        </div>
        {/* Testing porpuses only we should use a chainlink integration for this */}
        {/* <button
          onClick={() => drawMutation.mutate()}
          disabled={drawMutation.isPending}
          className="px-4 py-2 bg-white border border-deep-slate/10 text-deep-slate text-sm font-bold rounded-xl hover:bg-misty-rose transition-colors flex items-center gap-2 shadow-sm"
        >
          {drawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-terracotta" />}
          Test Draw Winner
        </button> */}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-8 bg-deep-slate text-seashell rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-xl blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-2">This Week&apos;s Jackpot</p>
                <h2 className="text-4xl sm:text-6xl font-display font-bold text-terracotta">${pool?.currentYieldPotUSDC.toFixed(2) ?? "0.00"}</h2>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-sm font-bold">
                  <Clock className="w-4 h-4 text-terracotta" /> {daysLeft} days left
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-terracotta" /> Enter the Pool</h3>
              {pool && (pool as any).isUserEntered ? (
                <div className="bg-terracotta/10 border border-terracotta/20 rounded-xl p-4 text-terracotta font-medium flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> You are entered in this week's draw! Good luck!
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-seashell/50 font-bold">$</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/10 border border-white/10 rounded-xl pl-8 pr-4 py-4 text-seashell placeholder:text-seashell/30 focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all font-display text-xl font-bold"
                      />
                    </div>
                    <button
                      onClick={handleDeposit}
                      disabled={isDepositing || enterMutation.isPending || !depositAmount || Number(depositAmount) <= 0}
                      className="px-8 py-4 bg-terracotta hover:bg-[#d1614a] text-white font-bold rounded-xl transition-all shadow-lg shadow-terracotta/20 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                    >
                      {isDepositing || enterMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {(depositStep as any) === 'approving' ? 'Approving...' : 'Entering...'}</>
                      ) : chainId !== 8453 ? (
                        "Switch to Base"
                      ) : (
                        "Deposit to Enter"
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-seashell/50 mt-3 font-medium">Your deposited principal is never at risk. Deployed to YO Vault on Base.</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">Status</p>
                <p className="font-bold capitalize">{pool?.status}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">Participants</p>
                <p className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-terracotta" /> {pool?.participantsCount ?? 0} In Pool</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-4 bg-white/50 border border-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-4 h-4 text-terracotta" />
            <h2 className="text-xl font-display font-bold text-deep-slate">Previous Winners</h2>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-deep-slate/50 text-center py-8 border-2 border-dashed border-deep-slate/10 rounded-xl">
              No draws have occurred yet.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((draw) => (
                <div key={draw.id} className="bg-white/60 p-4 rounded-xl border border-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40">Winner</p>
                      <p className="font-mono text-sm font-bold text-deep-slate mt-1">
                        {draw.winnerAddress.slice(0, 6)}...{draw.winnerAddress.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40">Prize</p>
                      <p className="font-bold text-terracotta mt-1">${draw.jackpotAmountUSDC.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-deep-slate/50">{draw.executedAt ? new Date(draw.executedAt).toLocaleDateString() : ""}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

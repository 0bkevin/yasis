"use client";

import { useUserPosition, useDeposit, useRedeem, useVaults, useUserPerformance, useYoClient } from "@yo-protocol/react";
import { VAULTS, parseTokenAmount } from "@yo-protocol/core";
import { 
  ArrowRightLeft,
  Coffee,
  HeartHandshake,
  TrendingUp,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatUnits, erc20Abi } from "viem";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserConfig } from "@/actions/user-config";
import { createUserTransaction } from "@/actions/user-data";
import { allocateAvailableYield, getUserWealth } from "@/actions/user-wealth";
import { getDonationRouterExecutionPlan, recordDonationRouterExecution } from "@/actions/router-execution";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useSwitchChain } from "wagmi";
import Link from "next/link";
import { TransactionHistory } from "./TransactionHistory";
import { getAquiferHealth, getAquiferProgress, getAquiferSubtitle, getAquiferTypeLabel } from "@/lib/aquifers";
import { getUpcomingSubscriptionPayouts } from "@/actions/subscription-payouts";
import { getTaxShieldConfig } from "@/actions/tax-shield";

const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export function DashboardOverview() {
  const queryClient = useQueryClient();

  const [depositAmount, setManualAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Your Oasis has been nourished.");
  const [routingStep, setRoutingStep] = useState<"idle" | "redeeming" | "transferring">("idle");
  const pendingDonationRoutesRef = useRef<Array<{ id: string; name: string; amountUSDC: number; destinationAddress: string }>>([]);
  const currentDonationRouteRef = useRef<{ id: string; name: string; amountUSDC: number; destinationAddress: string } | null>(null);
  const completedDonationCountRef = useRef(0);
  const pendingDepositAmountRef = useRef<number>(0);

  // Fetch DB Data
  const { data: userConfig } = useQuery({
    queryKey: ['user-config'],
    queryFn: () => getUserConfig(),
  });
  const yieldRouters = userConfig?.yieldRouters ?? [];
  const activeDonationRouters = yieldRouters.filter(
    (router) => router.isActive && router.type === "donation" && Boolean(router.destinationAddress),
  );
  const subscriptionRouters = yieldRouters.filter((router) => router.type === "subscription");

  // Fetch YO Vault Data
  const vaultAddress = VAULTS.yoUSD.address;
  const { position, refetch: refetchPosition } = useUserPosition(vaultAddress);
  const { vaults } = useVaults();
  const { address: userAddress, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const client = useYoClient();
  const { performance } = useUserPerformance(vaultAddress, userAddress);

  // Setup Deposit Hook
  const { deposit, step: depositStep, isLoading: isDepositing, error: depositError, reset: resetDeposit } = useDeposit({
    vault: vaultAddress,
    onConfirmed: async () => {
      const amount = pendingDepositAmountRef.current;
      if (amount > 0) {
        await createUserTransaction({
          kind: "deposit",
          title: "Manual Deposit",
          details: "Deposit from connected wallet",
          amountUSDC: amount,
          direction: "in",
          status: "completed",
        });
        pendingDepositAmountRef.current = 0;
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
        queryClient.invalidateQueries({ queryKey: ["user-wealth"] });
      }
      setManualAmount("");
      setSuccessMessage("Deposit Successful!");
      setShowSuccess(true);
      refetchPosition();
      setTimeout(() => setShowSuccess(false), 5000);
    }
  });

  // Wagmi transfer setup for donations
  const { writeContract, data: transferHash, error: transferError, reset: resetTransfer } = useWriteContract();
  const { isSuccess: isTransferSuccess, isLoading: isTransferring } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  // Setup Redeem Hook (for Routing Yield)
  const { 
    redeem, 
    isLoading: isRedeeming, 
    error: redeemError, 
    reset: resetRedeem,
    instant,
    isSuccess: isRedeemSuccess
  } = useRedeem({ vault: vaultAddress });

  useEffect(() => {
    if (isRedeemSuccess && routingStep === 'redeeming') {
      refetchPosition();
      
      if (!instant) {
        setRoutingStep('idle');
        setSuccessMessage("Yield redeemed. The withdrawal is pending and will be available to route in up to 24 hours.");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 8000);
        return;
      }

      setRoutingStep('transferring');
      const nextRoute = pendingDonationRoutesRef.current.shift() ?? null;
      currentDonationRouteRef.current = nextRoute;

      if (!nextRoute) {
        setRoutingStep('idle');
        setSuccessMessage("No active donation routes were eligible to execute.");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        return;
      }

      writeContract({
        address: BASE_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [nextRoute.destinationAddress as `0x${string}`, parseTokenAmount(nextRoute.amountUSDC.toFixed(6), 6)],
      });
    }
  }, [isRedeemSuccess, routingStep, instant, refetchPosition, writeContract]);

  // Watch for transfer success
  useEffect(() => {
    if (isTransferSuccess && routingStep === 'transferring' && currentDonationRouteRef.current) {
      const completedRoute = currentDonationRouteRef.current;
      const txHash = transferHash;

      currentDonationRouteRef.current = null;
      completedDonationCountRef.current += 1;

      void recordDonationRouterExecution({
        routerId: completedRoute.id,
        amountUSDC: completedRoute.amountUSDC,
        status: "completed",
        txHash,
      });

      const nextRoute = pendingDonationRoutesRef.current.shift() ?? null;
      currentDonationRouteRef.current = nextRoute;

      if (nextRoute) {
        writeContract({
          address: BASE_USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [nextRoute.destinationAddress as `0x${string}`, parseTokenAmount(nextRoute.amountUSDC.toFixed(6), 6)],
        });
        return;
      }

      setRoutingStep('idle');
      setSuccessMessage(
        completedDonationCountRef.current === 1
          ? "Executed 1 donation route."
          : `Executed ${completedDonationCountRef.current} donation routes.`,
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      completedDonationCountRef.current = 0;

      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-wealth'] });
    }
  }, [isTransferSuccess, routingStep, queryClient, transferHash, writeContract]);

  useEffect(() => {
    if (transferError && routingStep === 'transferring' && currentDonationRouteRef.current) {
      const failedRoute = currentDonationRouteRef.current;
      currentDonationRouteRef.current = null;
      pendingDonationRoutesRef.current = [];
      completedDonationCountRef.current = 0;
      setRoutingStep('idle');

      void recordDonationRouterExecution({
        routerId: failedRoute.id,
        amountUSDC: failedRoute.amountUSDC,
        status: "failed",
        errorMessage: transferError.message,
      });

      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
    }
  }, [transferError, routingStep, queryClient]);

  // Calculate live values
  const totalAssets = useMemo(() => {
    if (!position) return 0;
    return Number(formatUnits(position.assets, 6));
  }, [position]);

  const { data: wealthSnapshot } = useQuery({
    queryKey: ["user-wealth", totalAssets],
    queryFn: () => getUserWealth(totalAssets),
  });

    const { data: taxConfig } = useQuery({
    queryKey: ["tax-shield", "config"],
    queryFn: () => getTaxShieldConfig(),
  });

  const { data: upcomingPayouts = [] } = useQuery({
    queryKey: ["subscription-payouts", "upcoming"],
    queryFn: () => getUpcomingSubscriptionPayouts(4),
  });

  const allocateYieldMutation = useMutation({
    mutationFn: () => allocateAvailableYield(totalAssets),
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["user-config"] });
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["user-wealth"] });
      setSuccessMessage(
        result.allocatedTotal > 0
          ? `Allocated $${result.allocatedTotal.toFixed(2)} of yield into your aquifers.`
          : "No free yield available to allocate yet."
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    },
  });

  const currentVaultStats = vaults?.find(v => v.contracts.vaultAddress.toLowerCase() === vaultAddress.toLowerCase());
  const currentApy = currentVaultStats?.yield?.['7d'] ? parseFloat(currentVaultStats.yield['7d']) * 100 : 0;
  const displayBalance = totalAssets;
  const displayYield = totalAssets * (currentApy / 100) / 12;
  
  // Use on-chain performance data for bulletproof accounting if available, fallback to DB
  const unrealizedPnL = performance ? Number(performance.unrealized.formatted) : 0;
  const earnedYield = performance ? unrealizedPnL : (wealthSnapshot?.earnedYield ?? 0);
  const protectedPrincipal = performance ? Math.max(totalAssets - unrealizedPnL, 0) : (wealthSnapshot?.protectedPrincipal ?? 0);
  const allocatedYield = wealthSnapshot?.allocatedYield ?? 0;
  const availableYield = Math.max(earnedYield - allocatedYield, 0);

  const activeAquifers = userConfig?.aquifers && userConfig.aquifers.length > 0 
    ? userConfig.aquifers
    : [];

  const handleManualDeposit = async () => {
    if (chainId !== 8453) {
      switchChain({ chainId: 8453 });
      return;
    }

    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) return;
    try {
      const dotIndex = depositAmount.indexOf('.');
      const sanitizedAmount = dotIndex !== -1 
        ? depositAmount.slice(0, dotIndex + 7) 
        : depositAmount;

      const amountNumber = Number(sanitizedAmount);
      const amountRaw = parseTokenAmount(sanitizedAmount, 6);
      pendingDepositAmountRef.current = amountNumber;
      await deposit({
        token: VAULTS.yoUSD.underlying.address[8453]!, 
        amount: amountRaw
      });
    } catch (e) {
      pendingDepositAmountRef.current = 0;
      console.error("Deposit failed", e);
    }
  };

  const handleRouteYield = async () => {
    if (chainId !== 8453) {
      switchChain({ chainId: 8453 });
      return;
    }

    if (!position || position.shares === 0n) return;
    if (!client) {
      alert("YO Client not initialized yet.");
      return;
    }

    try {
      const plan = await getDonationRouterExecutionPlan(availableYield);

      if (plan.executableRouters.length === 0) {
        alert("No active donation routes are ready to execute yet.");
        return;
      }

      if (!plan.hasSufficientYield) {
        alert(`You only have $${availableYield.toFixed(2)} of unallocated yield available to route right now.`);
        return;
      }

      const rawAmountToWithdraw = parseTokenAmount(plan.totalAmountUSDC.toFixed(6), 6);
      const sharesToRedeem = await client.quoteConvertToShares(vaultAddress, rawAmountToWithdraw);
      
      if (sharesToRedeem > position.shares) {
        alert("Not enough yield/balance to execute these routes.");
        return;
      }

      pendingDonationRoutesRef.current = [...plan.executableRouters];
      currentDonationRouteRef.current = null;
      completedDonationCountRef.current = 0;
      setRoutingStep('redeeming');
      await redeem(sharesToRedeem);
    } catch (e) {
      pendingDonationRoutesRef.current = [];
      currentDonationRouteRef.current = null;
      completedDonationCountRef.current = 0;
      setRoutingStep('idle');
      console.error("Redeem failed", e);
    }
  };

  const errorState = depositError || redeemError || transferError;

  return (
    <div className="relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-green-50 border border-green-200 p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-[calc(100vw-2rem)]"
          >
            <CheckCircle2 className="text-green-500 w-6 h-6" />
            <div>
              <p className="font-bold text-green-800">Success</p>
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          </motion.div>
        )}
        
        {errorState && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-50 border border-red-200 p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-[calc(100vw-2rem)]"
          >
            <AlertCircle className="text-red-500 w-6 h-6" />
            <div>
              <p className="font-bold text-red-800">Action Failed</p>
              <p className="text-sm text-red-600 max-w-xs truncate">{errorState.message}</p>
            </div>
            <button onClick={() => { resetDeposit(); resetRedeem(); resetTransfer(); }} className="text-xs font-bold uppercase tracking-widest ml-4 bg-red-100 px-3 py-1.5 rounded-xl text-red-700">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Column */}
        <div className="lg:col-span-7 space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-deep-slate/60 font-medium tracking-wide uppercase text-xs">Total Cultivated Wealth</p>
            <div className="flex items-end gap-4">
              <h2 className="text-4xl sm:text-7xl lg:text-8xl font-display text-deep-slate tracking-tighter -ml-1 font-bold">
                ${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/50 border border-white rounded-xl px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-deep-slate/40">Protected Principal</p>
                <p className="text-xl font-display font-bold text-deep-slate mt-1">${protectedPrincipal.toFixed(2)}</p>
              </div>
              <div className="bg-white/50 border border-white rounded-xl px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-deep-slate/40">Earned Yield</p>
                <p className="text-xl font-display font-bold text-terracotta mt-1">${earnedYield.toFixed(2)}</p>
              </div>
              <div className="bg-white/50 border border-white rounded-xl px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-deep-slate/40">Free Yield</p>
                <p className="text-xl font-display font-bold text-deep-slate mt-1">${availableYield.toFixed(2)}</p>
              </div>
            </div>
             
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center bg-misty-rose text-terracotta px-3 py-1.5 rounded-xl text-sm font-medium border border-terracotta/20 shadow-sm">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                +${displayYield.toFixed(2)} Yield/mo
              </span>
              <span className="text-sm text-deep-slate/60 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-terracotta opacity-40"></span>
                  <span className="relative inline-flex rounded-xl h-2 w-2 bg-terracotta"></span>
                </span>
                Earning {currentApy.toFixed(2)}% APY via YO
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => allocateYieldMutation.mutate()}
                disabled={allocateYieldMutation.isPending || availableYield <= 0 || activeAquifers.length === 0}
                className="px-5 py-3 bg-deep-slate text-seashell rounded-xl font-bold transition-all hover:bg-deep-slate/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {allocateYieldMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Allocate Free Yield To Aquifers
              </button>
              <div className="px-4 py-3 rounded-xl border border-deep-slate/10 bg-white/50 text-sm text-deep-slate/60">
                ${allocatedYield.toFixed(2)} already reserved inside your aquifers.
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display text-deep-slate font-bold">Your Aquifers</h3>
              <Link 
                href="/dashboard/aquifers"
                className="text-sm font-medium text-terracotta hover:text-terracotta/80 transition-colors uppercase tracking-wider"
              >
                Manage &rarr;
              </Link>
            </div>

            <div className="space-y-8">
              {activeAquifers.length === 0 ? (
                <p className="text-sm text-deep-slate/60 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                  No aquifers configured yet. Create your first allocation in Aquifers.
                </p>
              ) : (
                activeAquifers.map((aquifer) => (
                  <Pocket
                    key={aquifer.id}
                    name={aquifer.name}
                    amount={Number(aquifer.balanceUSDC ?? 0)}
                    percent={getAquiferProgress(aquifer)}
                    eyebrow={getAquiferTypeLabel(aquifer.type)}
                    subtitle={getAquiferSubtitle(aquifer)}
                    health={getAquiferHealth(aquifer)}
                    allocationPercent={aquifer.allocationPercent}
                  />
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          
          <TransactionHistory />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display text-deep-slate font-bold">Upcoming Subscription Payouts</h3>
              <Link href="/dashboard/aquifers" className="text-sm font-medium text-terracotta hover:underline">View Aquifers</Link>
            </div>
            
          {/* Tax Shield Status */}
          {taxConfig?.profile.isEnabled && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
              className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display text-deep-slate font-bold flex items-center gap-2">
                  Tax Shield Active
                </h3>
                <Link href="/dashboard/tax-shield" className="text-sm font-medium text-terracotta hover:underline">Manage</Link>
              </div>
              <div className="flex justify-between items-end bg-white/60 p-4 rounded-xl border border-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-deep-slate/40">Protected Reserve</p>
                  <p className="text-2xl font-display font-bold text-deep-slate mt-1">${taxConfig.reserve.balanceUSDC.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-deep-slate/40">Routing</p>
                  <p className="text-sm font-bold text-terracotta mt-1">{taxConfig.profile.routingPercent}% of deposits</p>
                </div>
              </div>
            </motion.div>
          )}
  
            {upcomingPayouts.length === 0 ? (
              <p className="text-sm text-deep-slate/55 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                No subscription payouts scheduled yet.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingPayouts.map((payout) => (
                  <div key={payout.id} className="bg-white/60 p-4 rounded-xl border border-white flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-sm text-deep-slate">{payout.merchantName}</p>
                      <p className="text-xs text-deep-slate/50">
                        {payout.nextPayoutAt ? new Date(payout.nextPayoutAt).toLocaleDateString() : "No date"} - {payout.status}
                      </p>
                    </div>
                    <p className="font-display text-xl font-bold text-deep-slate">${payout.monthlyAmountUSDC.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Add Funds */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-deep-slate text-seashell rounded-xl p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-xl blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150"></div>
            
            <h3 className="text-2xl font-display mb-6 relative z-10 font-bold">Nourish your Oasis</h3>
            
            <div className="relative z-10 space-y-4">
              <div className="relative">
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-6 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all font-display text-xl font-bold"
                  placeholder="0.00"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-bold">USDC</span>
              </div>

              <button 
                onClick={handleManualDeposit}
                disabled={chainId === 8453 && (isDepositing || !depositAmount)}
                className="w-full py-4 bg-seashell text-deep-slate rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chainId !== 8453 ? (
                  <>Switch to Base</>
                ) : isDepositing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
                    {depositStep === 'approving' ? 'Approving USDC...' : 'Depositing...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-terracotta" />
                    Manual Boost
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Yield Routers Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display text-deep-slate font-bold">
                Yield Routers
              </h3>
              <Link href="/dashboard/donations" className="text-sm font-medium text-terracotta hover:underline">
                View All &rarr;
              </Link>
            </div>

            {yieldRouters.length === 0 ? (
               <p className="text-deep-slate/60 text-sm mb-4 leading-relaxed font-light text-center py-4 border-2 border-dashed border-deep-slate/10 rounded-xl">
                 No routers active.
               </p>
            ) : (
              <div className="space-y-4 mb-6">
                {yieldRouters.slice(0, 2).map(router => (
                  <div key={router.id} className="bg-white/60 p-4 rounded-xl border border-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-misty-rose/50 p-2 rounded-xl">
                        {router.type === 'subscription' ? <Coffee className="w-4 h-4 text-terracotta" /> : <HeartHandshake className="w-4 h-4 text-terracotta" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-deep-slate">{router.name}</p>
                        <p className="text-deep-slate/50 text-xs">
                          ${router.amountUSDC.toFixed(2)}/mo {router.type === 'subscription' ? ' - planning only' : ' - onchain donation'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-xl ${router.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleRouteYield}
              disabled={chainId === 8453 && (isRedeeming || isTransferring || totalAssets <= 0 || activeDonationRouters.length === 0)}
              className="w-full py-4 bg-terracotta hover:bg-[#d1614a] text-white rounded-xl font-bold transition-all shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {chainId !== 8453 ? (
                <>Switch to Base</>
              ) : routingStep === 'redeeming' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Redeeming Yield...</>
              ) : routingStep === 'transferring' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending Donations...</>
              ) : (
                <><ArrowRightLeft className="w-4 h-4" /> Execute Donation Routes</>
              )}
            </button>
            <p className="text-xs text-deep-slate/50 mt-3 leading-relaxed">
              Only active donation routers execute onchain here. Subscription routers remain planning targets until merchant payout automation is built.
            </p>
            {subscriptionRouters.length > 0 && (
              <p className="text-xs text-deep-slate/40 mt-2 leading-relaxed">
                {subscriptionRouters.length} subscription router{subscriptionRouters.length === 1 ? '' : 's'} currently track intended monthly coverage but do not send merchant payments yet.
              </p>
            )}
            <p className="text-xs text-deep-slate/40 mt-2 leading-relaxed">
              Withdrawal flows are not exposed in the product yet, so principal remains informationally protected rather than user-withdrawable from this screen.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export function Pocket({
  name,
  amount,
  percent,
  eyebrow,
  subtitle,
  health,
  allocationPercent,
}: {
  name: string;
  amount: number;
  percent: number;
  eyebrow?: string;
  subtitle?: string;
  health?: string;
  allocationPercent?: number;
}) {
  return (
    <div className="group">
      {(eyebrow || health) && (
        <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-wider font-bold text-deep-slate/40">
          <span>{eyebrow}</span>
          <span>{health}</span>
        </div>
      )}
      <div className="flex justify-between items-end mb-3">
        <span className="font-bold text-deep-slate text-lg">
          {name}
        </span>
        <span className="font-display text-2xl text-deep-slate font-bold">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      {subtitle && <p className="text-sm text-deep-slate/50 mb-3">{subtitle}</p>}
      <div className="w-full h-2 bg-misty-rose rounded-xl overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="h-full bg-terracotta rounded-xl relative" 
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 animate-[shimmer_2s_infinite]"></div>
        </motion.div>
      </div>
      {typeof allocationPercent === "number" && (
        <p className="text-xs text-deep-slate/45 mt-2 font-medium">{allocationPercent}% of new yield</p>
      )}
    </div>
  );
}

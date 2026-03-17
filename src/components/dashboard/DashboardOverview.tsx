"use client";

import { useAccount } from "wagmi";
import { useVaultState, useUserPosition, useDeposit, useRedeem } from "@yo-protocol/react";
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
import { useState, useMemo } from "react";
import { formatUnits, erc20Abi } from "viem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserConfig } from "@/actions/user-config";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import Link from "next/link";
import { TransactionHistory } from "./TransactionHistory";

const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export function DashboardOverview() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [depositAmount, setManualAmount] = useState("100");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Your Oasis has been nourished.");
  const [routingStep, setRoutingStep] = useState<"idle" | "redeeming" | "transferring">("idle");

  // Fetch DB Data
  const { data: userConfig } = useQuery({
    queryKey: ['user-config'],
    queryFn: () => getUserConfig(),
  });

  // Fetch YO Vault Data
  const vaultAddress = VAULTS.yoUSD.address;
  const { vaultState } = useVaultState(vaultAddress);
  const { position, refetch: refetchPosition } = useUserPosition(vaultAddress);

  // Setup Deposit Hook
  const { deposit, step: depositStep, isLoading: isDepositing, error: depositError, reset: resetDeposit } = useDeposit({
    vault: vaultAddress,
    onConfirmed: () => {
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
  const { redeem, isLoading: isRedeeming, error: redeemError, reset: resetRedeem } = useRedeem({
    vault: vaultAddress,
    onConfirmed: () => {
      refetchPosition();
      
      if (routingStep === 'redeeming' && userConfig) {
        const activeDonations = userConfig.yieldRouters.filter(r => r.isActive && r.type === 'donation');
        
        if (activeDonations.length > 0) {
          setRoutingStep('transferring');
          const router = activeDonations[0];
          if (router.destinationAddress) {
            writeContract({
              address: BASE_USDC_ADDRESS,
              abi: erc20Abi,
              functionName: 'transfer',
              args: [router.destinationAddress as `0x${string}`, parseTokenAmount(router.amountUSDC.toString(), 6)],
            });
          }
        } else {
          setRoutingStep('idle');
          setSuccessMessage("Yield successfully routed to your wallet.");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        }
      }
    }
  });

  // Watch for transfer success
  useMemo(() => {
    if (isTransferSuccess && routingStep === 'transferring') {
      setRoutingStep('idle');
      setSuccessMessage("Donation successfully transferred!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [isTransferSuccess, routingStep]);

  // Calculate live values
  const totalAssets = useMemo(() => {
    if (!position) return 0;
    return Number(formatUnits(position.assets, 6));
  }, [position]);

  const currentApy = vaultState ? (Number(vaultState.exchangeRate) / 1e18 - 1) * 100 : 8.5;
  const isDemoMode = totalAssets === 0;
  const displayBalance = isDemoMode ? 5000 : totalAssets;
  const displayYield = isDemoMode ? 45.20 : (totalAssets * (currentApy / 100) / 12); 

  const activePockets = userConfig?.pockets && userConfig.pockets.length > 0 
    ? userConfig.pockets 
    : [
        { id: '1', name: "Liquid Spending", percentage: 60 },
        { id: '2', name: "Taxes (Q1)", percentage: 25 },
        { id: '3', name: "Wealth Builder", percentage: 15 }
      ];

  const handleManualDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    try {
      const amountRaw = parseTokenAmount(depositAmount, 6);
      await deposit({
        token: VAULTS.yoUSD.underlying.address[8453]!, 
        amount: amountRaw
      });
    } catch (e) {
      console.error("Deposit failed", e);
    }
  };

  const handleSweep = async () => {
    try {
      const amountRaw = parseTokenAmount("0.80", 6);
      await deposit({
        token: VAULTS.yoUSD.underlying.address[8453]!,
        amount: amountRaw
      });
    } catch (e) {
      console.error("Sweep failed", e);
    }
  };

  const handleRouteYield = async () => {
    if (!position || position.shares === 0n || !userConfig) return;
    try {
      const activeRouters = userConfig.yieldRouters.filter(r => r.isActive);
      if (activeRouters.length === 0) return;

      const totalUsdcRequired = activeRouters.reduce((acc, r) => acc + r.amountUSDC, 0);
      const sharesToRedeem = parseTokenAmount(totalUsdcRequired.toFixed(6), 6);
      
      if (sharesToRedeem > position.shares) {
        alert("Not enough yield/balance to execute these routes.");
        return;
      }

      setRoutingStep('redeeming');
      await redeem(sharesToRedeem);
    } catch (e) {
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
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-green-50 border border-green-200 p-4 rounded-xl shadow-xl flex items-center gap-3"
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
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-50 border border-red-200 p-4 rounded-xl shadow-xl flex items-center gap-3"
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
            {isDemoMode && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-terracotta/10 text-terracotta px-3 py-1 rounded-xl border border-terracotta/20 inline-block mb-2">
                Demo Mode
              </span>
            )}
            <p className="text-deep-slate/60 font-medium tracking-wide uppercase text-xs">Total Cultivated Wealth</p>
            <div className="flex items-end gap-4">
              <h2 className="text-7xl lg:text-8xl font-display text-deep-slate tracking-tighter -ml-1 font-bold">
                ${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
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
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display text-deep-slate font-bold">Your Allocations</h3>
              <Link 
                href="/dashboard/pockets"
                className="text-sm font-medium text-terracotta hover:text-terracotta/80 transition-colors uppercase tracking-wider"
              >
                Manage &rarr;
              </Link>
            </div>

            <div className="space-y-8">
              {activePockets.map(pocket => (
                <Pocket 
                  key={pocket.id}
                  name={pocket.name} 
                  amount={displayBalance * (pocket.percentage / 100)} 
                  percent={pocket.percentage} 
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          
          <TransactionHistory />

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
                disabled={isDepositing || !depositAmount}
                className="w-full py-4 bg-seashell text-deep-slate rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositing ? (
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

            {userConfig?.yieldRouters.length === 0 ? (
               <p className="text-deep-slate/60 text-sm mb-4 leading-relaxed font-light text-center py-4 border-2 border-dashed border-deep-slate/10 rounded-xl">
                 No routers active.
               </p>
            ) : (
              <div className="space-y-4 mb-6">
                {userConfig?.yieldRouters.slice(0, 2).map(router => (
                  <div key={router.id} className="bg-white/60 p-4 rounded-xl border border-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-misty-rose/50 p-2 rounded-xl">
                        {router.type === 'subscription' ? <Coffee className="w-4 h-4 text-terracotta" /> : <HeartHandshake className="w-4 h-4 text-terracotta" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-deep-slate">{router.name}</p>
                        <p className="text-deep-slate/50 text-xs">${router.amountUSDC.toFixed(2)}/mo</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-xl ${router.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleRouteYield}
              disabled={isRedeeming || isTransferring || isDemoMode || (userConfig?.yieldRouters.filter(r => r.isActive).length === 0)}
              className="w-full py-4 bg-terracotta hover:bg-[#d1614a] text-white rounded-xl font-bold transition-all shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {routingStep === 'redeeming' && <><Loader2 className="w-5 h-5 animate-spin" /> Redeeming Yield...</>}
              {routingStep === 'transferring' && <><Loader2 className="w-5 h-5 animate-spin" /> Sending Donations...</>}
              {routingStep === 'idle' && <><ArrowRightLeft className="w-4 h-4" /> Execute Yield Routes</>}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export function Pocket({ name, amount, percent }: { name: string, amount: number, percent: number }) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <span className="font-bold text-deep-slate text-lg">
          {name}
        </span>
        <span className="font-display text-2xl text-deep-slate font-bold">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
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
    </div>
  );
}

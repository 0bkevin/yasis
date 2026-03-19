"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getUserConfig } from "@/actions/user-config";
import { getUserWealth } from "@/actions/user-wealth";
import { getRecentAquiferEvents } from "@/actions/aquifers";
import { EditPocketsModal } from "@/components/dashboard/EditPocketsModal";
import { useState, useMemo } from "react";
import { WalletCards, Settings } from "lucide-react";
import { useUserPosition, useVaults, useUserPerformance } from "@yo-protocol/react";
import { useAccount } from "wagmi";
import { VAULTS } from "@yo-protocol/core";
import { formatUnits } from "viem";
import Link from "next/link";
import {
  estimateSubscriptionPrincipal,
  formatApyBps,
  formatAquiferEventType,
  getAquiferBadgeTone,
  getAquiferHealth,
  getAquiferProgress,
  getAquiferSubtitle,
  getAquiferTypeLabel,
  getSubscriptionFundingState,
} from "@/lib/aquifers";

export function AquiferManagementPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { data: userConfig } = useQuery({
    queryKey: ["user-config"],
    queryFn: () => getUserConfig(),
  });

  const vaultAddress = VAULTS.yoUSD.address;
  const { position } = useUserPosition(vaultAddress);
  const { address: userAddress } = useAccount();
  const { performance } = useUserPerformance(vaultAddress, userAddress);
  const { vaults } = useVaults();

  const totalAssets = useMemo(() => {
    if (!position) return 0;
    return Number(formatUnits(position.assets, 6));
  }, [position]);

  const currentVaultStats = vaults?.find(v => v.contracts.vaultAddress.toLowerCase() === vaultAddress.toLowerCase() && v.chain.id === 8453);
  const currentApy = currentVaultStats?.yield?.['7d'] ? parseFloat(currentVaultStats.yield['7d']) * 100 : 0;

  const aquifers = userConfig?.aquifers ?? [];
  const { data: wealthSnapshot } = useQuery({
    queryKey: ["user-wealth", totalAssets],
    queryFn: () => getUserWealth(totalAssets),
  });

  const unrealizedPnL = performance ? Number(performance.unrealized.formatted) : 0;
  const earnedYield = performance ? unrealizedPnL : (wealthSnapshot?.earnedYield ?? 0);
  const protectedPrincipal = performance ? Math.max(totalAssets - unrealizedPnL, 0) : (wealthSnapshot?.protectedPrincipal ?? 0);
  const allocatedYield = wealthSnapshot?.allocatedYield ?? 0;
  const availableYield = Math.max(earnedYield - allocatedYield, 0);

  const { data: aquiferEvents = [] } = useQuery({
    queryKey: ["aquifer-events", "recent"],
    queryFn: () => getRecentAquiferEvents(12),
  });

  return (
    <div className="space-y-10">
      <EditPocketsModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialPockets={aquifers.map((aquifer) => ({
          ...aquifer,
          targetDate: aquifer.targetDate ? new Date(aquifer.targetDate).toISOString().slice(0, 10) : null,
          unlockAt: aquifer.unlockAt ? new Date(aquifer.unlockAt).toISOString().slice(0, 10) : null,
          estimatedApyBps: aquifer.estimatedApyBps ?? Math.round(currentApy * 100),
        }))}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
            <WalletCards className="w-8 h-8 text-terracotta" />
            Aquifers
          </h1>
          <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
            Design goal-aware aquifers that receive new yield, estimate subscription readiness, and track configuration history over time.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg"
        >
          <Settings className="w-4 h-4" /> Edit Aquifers
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-deep-slate text-seashell rounded-xl p-6">
          <p className="text-seashell/60 text-xs font-bold uppercase tracking-wider mb-2">Protected Principal</p>
          <p className="text-3xl font-display font-bold">${protectedPrincipal.toFixed(2)}</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Earned Yield</p>
          <p className="text-3xl font-display font-bold text-terracotta">${earnedYield.toFixed(2)}</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Unallocated Yield</p>
          <p className="text-3xl font-display font-bold text-deep-slate">${availableYield.toFixed(2)}</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Live YO APY</p>
          <p className="text-3xl font-display font-bold text-deep-slate">{currentApy.toFixed(2)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {aquifers.length === 0 ? (
            <div className="md:col-span-2 p-8 border-2 border-dashed border-deep-slate/10 rounded-xl text-center bg-white/40">
              <p className="text-deep-slate/60 font-medium">No aquifers yet.</p>
              <p className="text-sm text-deep-slate/45 mt-1">Use Edit Aquifers to define your first reserve, goal, or subscription pool.</p>
            </div>
          ) : (
            aquifers.map((aquifer, i) => {
              const progress = getAquiferProgress(aquifer);
              const health = getAquiferHealth(aquifer);
              const subtitle = getAquiferSubtitle(aquifer);
              const subscriptionState = getSubscriptionFundingState(aquifer, currentApy);

              return (
                <motion.div
                  key={aquifer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white/60 backdrop-blur-xl rounded-xl p-8 border border-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-deep-slate/40">{getAquiferTypeLabel(aquifer.type)}</span>
                        <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${getAquiferBadgeTone(aquifer.status)}`}>
                          {aquifer.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-display text-deep-slate font-bold">{aquifer.name}</h3>
                      <p className="text-sm text-deep-slate/50 mt-1">{subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-deep-slate">${Number(aquifer.balanceUSDC ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-deep-slate/45 mt-1">{aquifer.allocationPercent}% of new yield</p>
                      <Link href={`/dashboard/aquifers/${aquifer.id}`} className="text-xs text-terracotta hover:underline mt-2 inline-block">
                        View details
                      </Link>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-misty-rose rounded-xl overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-terracotta rounded-xl"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-deep-slate/55 mb-4">
                    <span>{health}</span>
                    <span>{progress.toFixed(0)}% progress</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/50 border border-deep-slate/10 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-deep-slate/40 font-bold mb-1">Overflow</p>
                      <p className="font-medium text-deep-slate/75">{aquifer.overflowMode.replace("_", " ")}</p>
                    </div>
                    <div className="bg-white/50 border border-deep-slate/10 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-deep-slate/40 font-bold mb-1">Vault Context</p>
                      <p className="font-medium text-deep-slate/75">${totalAssets.toFixed(2)} in vault</p>
                    </div>
                  </div>

                  {aquifer.type === "subscription" && (
                    <div className="mt-4 bg-deep-slate/5 border border-deep-slate/10 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-deep-slate/55 font-bold uppercase tracking-wider text-[10px]">Subscription Readiness</span>
                        <span className="font-bold text-deep-slate">{subscriptionState?.status ?? "Planning"}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-deep-slate/45 text-[10px] uppercase tracking-wider font-bold mb-1">Required Principal</p>
                          <p className="font-display text-xl text-deep-slate font-bold">
                            ${(subscriptionState?.requiredPrincipal ?? estimateSubscriptionPrincipal(aquifer.targetMonthlyOutflowUSDC ?? 0, currentApy)).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-deep-slate/45 text-[10px] uppercase tracking-wider font-bold mb-1">Coverage</p>
                          <p className="font-display text-xl text-deep-slate font-bold">{subscriptionState?.coverageMonths.toFixed(1) ?? "0.0"} mo</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-deep-slate/45 text-[10px] uppercase tracking-wider font-bold mb-1">Snapshot APY</p>
                          <p className="font-medium text-deep-slate/75">{formatApyBps(aquifer.estimatedApyBps) ?? currentApy.toFixed(2)}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aquifer.notes && (
                    <p className="text-sm text-deep-slate/55 mt-4 leading-relaxed">{aquifer.notes}</p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white">
            <h4 className="font-bold text-deep-slate mb-4">Subscription Planning</h4>
            <p className="text-sm text-deep-slate/60 leading-relaxed mb-4">
              Subscription aquifers now estimate how much principal would be needed to support a monthly target using the live YO APY shown above.
            </p>
            <p className="text-sm text-deep-slate/50 leading-relaxed">
              Formula: annual target spend divided by current APY, using a 12-month planning window.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white">
            <h4 className="font-bold text-deep-slate mb-4">Aquifer History</h4>
            {aquiferEvents.length === 0 ? (
              <p className="text-sm text-deep-slate/50 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                No aquifer history yet.
              </p>
            ) : (
              <div className="space-y-3">
                {aquiferEvents.map((event) => (
                  <div key={event.id} className="bg-white/60 p-3 rounded-xl border border-white">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold text-sm text-deep-slate">{event.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-deep-slate/40 font-bold mt-1">{formatAquiferEventType(event.eventType)}</p>
                      </div>
                      <p className="text-xs text-deep-slate/45 text-right">
                        {event.createdAt ? new Date(event.createdAt).toLocaleString() : "-"}
                      </p>
                    </div>
                    {event.details && <p className="text-sm text-deep-slate/55 mt-2 leading-relaxed">{event.details}</p>}
                    {typeof event.amountUSDC === "number" && (
                      <p className="text-sm font-bold text-terracotta mt-2">${event.amountUSDC.toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

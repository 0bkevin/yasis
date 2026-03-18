"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, History, Waves, Users, Share2 } from "lucide-react";
import { getAquiferDetails, getAquiferEventHistory } from "@/actions/aquifer-details";
import { executeDueSubscriptionPayouts, getSubscriptionPayoutExecutions, getSubscriptionPayoutSchedule, upsertSubscriptionPayoutSchedule } from "@/actions/subscription-payouts";
import { useVaults } from "@yo-protocol/react";
import { VAULTS } from "@yo-protocol/core";
import {
  formatApyBps,
  formatAquiferEventType,
  getAquiferBadgeTone,
  getAquiferProgress,
  getAquiferSubtitle,
  getAquiferTypeLabel,
  getSubscriptionFundingState,
} from "@/lib/aquifers";

export function AquiferDetailPage({ aquiferId }: { aquiferId: string }) {
  const { data: aquifer } = useQuery({
    queryKey: ["aquifer-detail", aquiferId],
    queryFn: () => getAquiferDetails(aquiferId),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["aquifer-events", aquiferId],
    queryFn: () => getAquiferEventHistory(aquiferId, 30),
  });

  const { data: payoutSchedule } = useQuery({
    queryKey: ["subscription-payout-schedule", aquiferId],
    queryFn: () => getSubscriptionPayoutSchedule(aquiferId),
  });

  const { data: payoutExecutions = [] } = useQuery({
    queryKey: ["subscription-payout-executions", aquiferId],
    queryFn: () => getSubscriptionPayoutExecutions(aquiferId, 12),
  });

  const [merchantName, setMerchantName] = useState<string | null>(null);
  const [billingDay, setBillingDay] = useState<string | null>(null);
  const [externalReference, setExternalReference] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const resolvedMerchantName = merchantName ?? payoutSchedule?.merchantName ?? "";
  const resolvedBillingDay = billingDay ?? (payoutSchedule ? String(payoutSchedule.billingDay) : "1");
  const resolvedExternalReference = externalReference ?? payoutSchedule?.externalReference ?? "";

  const payoutMutation = useMutation({
    mutationFn: () => upsertSubscriptionPayoutSchedule({
      aquiferId,
      merchantName: resolvedMerchantName,
      monthlyAmountUSDC: aquifer?.targetMonthlyOutflowUSDC ?? 0,
      billingDay: Number(resolvedBillingDay),
      externalReference: resolvedExternalReference,
      status: payoutSchedule?.status ?? "draft",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-payout-schedule", aquiferId] });
      queryClient.invalidateQueries({ queryKey: ["aquifer-events", aquiferId] });
    },
  });

  const executePayoutMutation = useMutation({
    mutationFn: () => executeDueSubscriptionPayouts(aquiferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-payout-schedule", aquiferId] });
      queryClient.invalidateQueries({ queryKey: ["subscription-payout-executions", aquiferId] });
      queryClient.invalidateQueries({ queryKey: ["aquifer-events", aquiferId] });
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
    },
  });

  const vaultAddress = VAULTS.yoUSD.address;
  const { vaults } = useVaults();
  
  const { data: participants = [] } = useQuery({
    queryKey: ["shared-aquifer-participants", aquiferId],
    queryFn: async () => {
      if (aquifer?.type !== 'shared') return [];
      const { getSharedAquiferParticipants } = await import("@/actions/shared-aquifers");
      return getSharedAquiferParticipants(aquiferId);
    },
    enabled: aquifer?.type === 'shared',
  });
  
  const handleInvite = async () => {
    try {
      const { createSharedAquiferInvite } = await import("@/actions/shared-aquifers");
      const res = await createSharedAquiferInvite(aquiferId);
      // In a real app, we'd copy this to clipboard
      alert("Invite link copied to clipboard! (ID: " + res.inviteId + ")");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create invite");
    }
  };
  

  const currentVaultStats = vaults?.find(v => v.contracts.vaultAddress.toLowerCase() === vaultAddress.toLowerCase());
  const currentApy = currentVaultStats?.yield?.['7d'] ? parseFloat(currentVaultStats.yield['7d']) * 100 : 0;

  if (!aquifer) {
    return <div className="p-8 text-deep-slate/60">Loading aquifer...</div>;
  }

  const progress = getAquiferProgress(aquifer);
  const subtitle = getAquiferSubtitle(aquifer);
  const subscriptionState = getSubscriptionFundingState(aquifer, currentApy);

  return (
    <div className="space-y-8">
      <Link href="/dashboard/aquifers" className="inline-flex items-center gap-2 text-sm font-bold text-terracotta hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Aquifers
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-8 bg-white/50 border border-white rounded-xl p-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40">{getAquiferTypeLabel(aquifer.type)}</span>
                <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${getAquiferBadgeTone(aquifer.status)}`}>
                  {aquifer.status}
                </span>
              </div>
              <h1 className="text-4xl font-display font-bold text-deep-slate">{aquifer.name}</h1>
              <p className="text-deep-slate/55 mt-2">{subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-display font-bold text-deep-slate">${Number(aquifer.balanceUSDC ?? 0).toFixed(2)}</p>
              <p className="text-sm text-deep-slate/45">{aquifer.allocationPercent}% of new yield</p>
            </div>
          </div>

          <div className="w-full h-3 bg-misty-rose rounded-xl overflow-hidden mb-3">
            <div className="h-full bg-terracotta rounded-xl" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm font-bold text-deep-slate/55 mb-6">{progress.toFixed(0)}% progress</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 border border-deep-slate/10 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-1">Overflow Behavior</p>
              <p className="font-medium text-deep-slate/75">{aquifer.overflowMode.replace("_", " ")}</p>
            </div>
            <div className="bg-white/50 border border-deep-slate/10 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-1">Notes</p>
              <p className="font-medium text-deep-slate/75">{aquifer.notes || "No notes yet."}</p>
            </div>
          </div>

          
          {aquifer.type === "shared" && (
            <div className="mt-6 bg-deep-slate text-seashell rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-terracotta" />
                  <h2 className="text-xl font-display font-bold">Shared Contributors</h2>
                </div>
                <button onClick={handleInvite} className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-sm font-bold flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Invite
                </button>
              </div>
              {participants.length === 0 ? (
                <p className="text-sm text-seashell/50">You are the only member of this shared aquifer.</p>
              ) : (
                <div className="space-y-3">
                  {participants.map(p => (
                    <div key={p.id} className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-mono text-sm">{p.walletAddress.slice(0,6)}...{p.walletAddress.slice(-4)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-seashell/50 mt-1">{p.role}</p>
                      </div>
                      <p className="font-bold text-terracotta">${p.contributionUSDC.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
  

          {aquifer.type === "subscription" && (
            <div className="mt-6 bg-deep-slate text-seashell rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Waves className="w-4 h-4 text-terracotta" />
                <h2 className="text-xl font-display font-bold">Subscription Planning Breakdown</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">Required Principal Snapshot</p>
                  <p className="text-2xl font-display font-bold">${Number(subscriptionState?.requiredPrincipal ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">Coverage</p>
                  <p className="text-2xl font-display font-bold">{subscriptionState?.coverageMonths.toFixed(1) ?? "0.0"} mo</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">APY Snapshot</p>
                  <p className="text-2xl font-display font-bold">{formatApyBps(aquifer.estimatedApyBps) ?? currentApy.toFixed(2)}%</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-lg font-display font-bold">Payout Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">Merchant Name</label>
                      <input
                        type="text"
                        value={resolvedMerchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-seashell placeholder:text-seashell/30 focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all"
                      placeholder="e.g. Netflix"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">Billing Day</label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        value={resolvedBillingDay}
                        onChange={(e) => setBillingDay(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-seashell placeholder:text-seashell/30 focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-seashell/50 mb-1">External Reference</label>
                  <input
                    type="text"
                    value={resolvedExternalReference}
                    onChange={(e) => setExternalReference(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-seashell placeholder:text-seashell/30 focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all"
                    placeholder="Customer or merchant reference"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-seashell/70">
                    Next payout: {payoutSchedule?.nextPayoutAt ? new Date(payoutSchedule.nextPayoutAt).toLocaleDateString() : "Not scheduled yet"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executePayoutMutation.mutate()}
                      disabled={executePayoutMutation.isPending || payoutSchedule?.status !== "active"}
                      className="px-4 py-3 rounded-xl bg-white/10 text-seashell font-bold hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      {executePayoutMutation.isPending ? "Running..." : "Run Due Payouts"}
                    </button>
                    <button
                      onClick={() => payoutMutation.mutate()}
                      disabled={payoutMutation.isPending || !resolvedMerchantName.trim()}
                      className="px-4 py-3 rounded-xl bg-terracotta text-white font-bold hover:bg-[#d1614a] transition-all disabled:opacity-50"
                    >
                      {payoutMutation.isPending ? "Saving..." : "Save Schedule"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-seashell/50 mb-3">Payout History</h4>
                  {payoutExecutions.length === 0 ? (
                    <p className="text-sm text-seashell/60">No payout executions recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {payoutExecutions.map((execution) => (
                        <div key={execution.id} className="bg-white/10 rounded-xl p-3 border border-white/10">
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="font-bold text-sm text-seashell">{execution.merchantName}</p>
                              <p className="text-xs text-seashell/60">
                                {execution.executedAt ? new Date(execution.executedAt).toLocaleString() : "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-seashell">${execution.amountUSDC.toFixed(2)}</p>
                              <p className="text-xs uppercase tracking-wider text-terracotta font-bold">{execution.status}</p>
                            </div>
                          </div>
                          {execution.details && <p className="text-sm text-seashell/70 mt-2">{execution.details}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="xl:col-span-4 bg-white/50 border border-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-terracotta" />
            <h2 className="text-xl font-display font-bold text-deep-slate">Aquifer History</h2>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-deep-slate/50 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
              No aquifer history yet.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-white/60 rounded-xl p-3 border border-white">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-deep-slate">{event.title}</p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mt-1">{formatAquiferEventType(event.eventType)}</p>
                    </div>
                    <p className="text-xs text-deep-slate/45 text-right">{event.createdAt ? new Date(event.createdAt).toLocaleString() : "-"}</p>
                  </div>
                  {event.details && <p className="text-sm text-deep-slate/55 mt-2 leading-relaxed">{event.details}</p>}
                  {typeof event.amountUSDC === "number" && <p className="text-sm font-bold text-terracotta mt-2">${event.amountUSDC.toFixed(2)}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

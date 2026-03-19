"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateRouterModal } from "@/components/dashboard/CreateRouterModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteYieldRouter, getUserConfig, toggleYieldRouter } from "@/actions/user-config";
import { getRecentYieldRouterExecutions } from "@/actions/router-execution";
import { getUserWealth } from "@/actions/user-wealth";
import { getActiveNgos } from "@/actions/ngos";
import { getDonationReceipts } from "@/actions/donation-receipts";
import { exportDonationReceiptsReport } from "@/actions/donation-receipts";
import { useUserPosition } from "@yo-protocol/react";
import { VAULTS } from "@yo-protocol/core";
import { formatUnits } from "viem";
import { useMemo } from "react";
import Link from "next/link";

export default function DonationsPage() {
  const [modalSeed, setModalSeed] = useState(0);
  const [editingRouter, setEditingRouter] = useState<null | {
    id: string;
    type: "subscription" | "donation";
    name: string;
    amountUSDC: number;
    destinationAddress?: string | null;
    ngoId?: string | null;
  }>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const vaultAddress = VAULTS.yoUSD.address;
  const { position } = useUserPosition(vaultAddress);
  const totalAssets = useMemo(() => {
    if (!position) return 0;
    return Number(formatUnits(position.assets, 6));
  }, [position]);

  const { data: userConfig } = useQuery({
    queryKey: ['user-config'],
    queryFn: () => getUserConfig(),
  });

  const { data: wealthSnapshot } = useQuery({
    queryKey: ["user-wealth", totalAssets],
    queryFn: () => getUserWealth(totalAssets),
  });

  const { data: executionHistory = [] } = useQuery({
    queryKey: ['yield-router-executions', 'recent'],
    queryFn: () => getRecentYieldRouterExecutions(12),
  });

  const { data: ngos = [] } = useQuery({
    queryKey: ['ngos', 'active'],
    queryFn: () => getActiveNgos(),
  });

  const { data: donationReceipts = [] } = useQuery({
    queryKey: ['donation-receipts', 'recent'],
    queryFn: () => getDonationReceipts(50),
  });

  const toggleRouter = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleYieldRouter(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-config'] });
    },
  });

  const removeRouter = useMutation({
    mutationFn: deleteYieldRouter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-config'] });
      queryClient.invalidateQueries({ queryKey: ['yield-router-executions'] });
    },
  });

  const exportReport = useMutation({
    mutationFn: exportDonationReceiptsReport,
  });

  const activeDonations = userConfig?.yieldRouters?.filter(r => r.type === 'donation') || [];
  const subscriptionRouters = userConfig?.yieldRouters?.filter(r => r.type === 'subscription') || [];
  const donationHistory = donationReceipts.slice(0, 8);

  const totalDonated = donationReceipts.reduce((acc, tx) => acc + tx.amountUSDC, 0);
  const routerNameById = new Map((userConfig?.yieldRouters ?? []).map((router) => [router.id, router.name]));
  const ngoById = new Map(ngos.map((ngo) => [ngo.id, ngo]));
  const totalImpactUnits = donationReceipts.reduce((acc, tx) => acc + tx.impactValue, 0);

  const openCreateModal = () => {
    setEditingRouter(null);
    setModalSeed((value) => value + 1);
    setModalOpen(true);
  };

  const openEditModal = (router: {
    id: string;
    type: "subscription" | "donation";
    name: string;
    amountUSDC: number;
    destinationAddress?: string | null;
    ngoId?: string | null;
  }) => {
    setEditingRouter(router);
    setModalSeed((value) => value + 1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRouter(null);
  };

  return (
    <div className="space-y-10">
      <CreateRouterModal
        key={`${editingRouter?.id ?? 'new'}-${modalSeed}`}
        isOpen={isModalOpen}
        onClose={closeModal}
        initialRouter={editingRouter}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-terracotta" />
            Yield Routers
          </h1>
          <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
            Manage external donation routes and internal subscription targets. Only donation routes currently execute onchain.
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          onClick={openCreateModal}
          className="px-6 py-3 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> New Router
        </motion.button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => exportReport.mutate()}
          disabled={exportReport.isPending || donationReceipts.length === 0}
          className="px-4 py-3 rounded-xl border border-deep-slate/10 bg-white/60 text-deep-slate font-bold hover:bg-white disabled:opacity-50"
        >
          {exportReport.isPending ? "Preparing report..." : "Generate Donation Report"}
        </button>
      </div>

      {exportReport.data && (
        <div className="bg-white/50 border border-white rounded-xl p-6">
          <div className="flex justify-between items-center gap-4 mb-3">
            <h3 className="text-xl font-display font-bold text-deep-slate">Donation Report Preview</h3>
            <span className="text-sm text-deep-slate/50">{exportReport.data.fileName}</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-deep-slate/70 bg-white rounded-xl border border-deep-slate/10 p-4 overflow-x-auto">
            {exportReport.data.content}
          </pre>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
        <p className="text-sm leading-relaxed">
          Live behavior: donation routers can be executed from the dashboard using available yield. Subscription routers are planning-only for now and do not send merchant payments yet.
        </p>
      </div>

      <div className="bg-white/50 border border-white rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-display font-bold text-deep-slate">Curated NGOs</h3>
          <Link href="/dashboard/donations/ngos" className="text-sm font-bold text-terracotta hover:underline">
            Manage NGOs
          </Link>
        </div>
        {ngos.length === 0 ? (
          <p className="text-sm text-deep-slate/50">No curated NGOs available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ngos.map((ngo) => (
              <div key={ngo.id} className="bg-white rounded-xl border border-deep-slate/10 p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-2">{ngo.category}</p>
                <h4 className="font-bold text-deep-slate mb-2">{ngo.name}</h4>
                <p className="text-sm text-deep-slate/55 leading-relaxed mb-3">{ngo.description}</p>
                <p className="text-xs text-terracotta font-bold">1 USDC = {(ngo.impactUnitPerUSDC).toFixed(2)} {ngo.impactUnitLabel}</p>
                <Link href={`/dashboard/donations/ngos/${ngo.id}`} className="text-xs text-deep-slate/60 hover:text-terracotta hover:underline mt-3 inline-block">
                  View NGO details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-deep-slate text-seashell rounded-xl p-6">
          <p className="text-seashell/60 text-xs font-bold uppercase tracking-wider mb-2">Protected Principal</p>
          <p className="text-2xl sm:text-3xl font-display font-bold">${(wealthSnapshot?.protectedPrincipal ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Earned Yield</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-terracotta">${(wealthSnapshot?.earnedYield ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Yield Available To Route</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-deep-slate">${(wealthSnapshot?.availableYield ?? 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <h3 className="text-2xl font-display text-deep-slate font-bold mb-6">Donation Routes</h3>
          {activeDonations.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-deep-slate/10 rounded-xl text-center">
              <HeartHandshake className="w-10 h-10 text-deep-slate/20 mx-auto mb-3" />
              <p className="text-deep-slate/60 font-medium">No active donations configured.</p>
              <p className="text-sm text-deep-slate/40 mt-1">Set up a router to start making an impact with your yield.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDonations.map(donation => (
                <div key={donation.id} className="bg-white p-6 rounded-xl border border-deep-slate/10 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                  <div>
                    <h4 className="font-bold text-lg text-deep-slate mb-1">{donation.name}</h4>
                    <p className="text-sm text-deep-slate/50 font-mono">To: {donation.destinationAddress}</p>
                    {donation.ngoId && ngoById.get(donation.ngoId) && (
                      <p className="text-xs text-terracotta font-bold mt-1">NGO: {ngoById.get(donation.ngoId)?.name}</p>
                    )}
                  </div>
                  <div className="md:text-right">
                    <p className="text-2xl font-display font-bold text-terracotta">${donation.amountUSDC.toFixed(2)}<span className="text-sm text-deep-slate/50">/mo</span></p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-xl text-xs font-bold ${donation.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {donation.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:self-end">
                    <button
                      onClick={() => openEditModal(donation)}
                      disabled={toggleRouter.isPending || removeRouter.isPending}
                      className="px-3 py-2 rounded-xl border border-deep-slate/10 text-sm font-bold text-deep-slate hover:bg-misty-rose/40 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => toggleRouter.mutate({ id: donation.id, isActive: !donation.isActive })}
                      disabled={toggleRouter.isPending || removeRouter.isPending}
                      className="px-3 py-2 rounded-xl border border-deep-slate/10 text-sm font-bold text-deep-slate hover:bg-misty-rose/40 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {donation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {donation.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => removeRouter.mutate(donation.id)}
                      disabled={toggleRouter.isPending || removeRouter.isPending}
                      className="px-3 py-2 rounded-xl border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-deep-slate/10">
            <h4 className="text-xl font-display text-deep-slate font-bold mb-4">Subscription Targets</h4>
            {subscriptionRouters.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-deep-slate/10 rounded-xl text-center bg-white/40">
                <p className="text-deep-slate/60 font-medium">No subscription targets configured.</p>
                <p className="text-sm text-deep-slate/40 mt-1">These help you model monthly coverage, but they do not pay merchants yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptionRouters.map((router) => (
                  <div key={router.id} className="bg-white p-6 rounded-xl border border-deep-slate/10 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                    <div>
                      <h4 className="font-bold text-lg text-deep-slate mb-1">{router.name}</h4>
                      <p className="text-sm text-deep-slate/50">Planning target only. Merchant payouts are not automated yet.</p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-2xl font-display font-bold text-deep-slate">${router.amountUSDC.toFixed(2)}<span className="text-sm text-deep-slate/50">/mo</span></p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-xl text-xs font-bold ${router.isActive ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {router.isActive ? 'Planning' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:self-end">
                      <button
                        onClick={() => openEditModal(router)}
                        disabled={toggleRouter.isPending || removeRouter.isPending}
                        className="px-3 py-2 rounded-xl border border-deep-slate/10 text-sm font-bold text-deep-slate hover:bg-misty-rose/40 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => toggleRouter.mutate({ id: router.id, isActive: !router.isActive })}
                        disabled={toggleRouter.isPending || removeRouter.isPending}
                        className="px-3 py-2 rounded-xl border border-deep-slate/10 text-sm font-bold text-deep-slate hover:bg-misty-rose/40 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {router.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {router.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => removeRouter.mutate(router.id)}
                        disabled={toggleRouter.isPending || removeRouter.isPending}
                        className="px-3 py-2 rounded-xl border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="bg-deep-slate text-seashell rounded-xl p-8">
            <p className="text-seashell/60 text-sm font-bold uppercase tracking-wider mb-2">Lifetime Impact</p>
            <p className="text-5xl font-display font-bold mb-4">${totalDonated.toFixed(2)}</p>
            <p className="text-sm text-seashell/80 leading-relaxed font-light">
              You&apos;ve generated and routed real economic value simply by letting your capital sit in Oasis.
            </p>
            {totalImpactUnits > 0 && (
              <p className="text-sm text-terracotta mt-3 font-bold">Approx. {totalImpactUnits.toFixed(1)} impact units delivered across matched NGOs</p>
            )}
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white">
            <h4 className="font-bold text-deep-slate mb-4">Recent Transfers</h4>
            {donationHistory.length === 0 ? (
              <p className="text-sm text-deep-slate/50 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                No routed donations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {donationHistory.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center bg-white/60 p-3 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">{tx.ngoNameSnapshot}</p>
                      <p className="text-xs text-deep-slate/50">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-"}
                      </p>
                      <p className="text-xs text-terracotta font-bold mt-1">
                        ~{tx.impactValue.toFixed(1)} {tx.impactUnitLabelSnapshot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-terracotta">${tx.amountUSDC.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white">
            <h4 className="font-bold text-deep-slate mb-4">Execution Log</h4>
            {executionHistory.length === 0 ? (
              <p className="text-sm text-deep-slate/50 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                No router executions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {executionHistory.map((entry) => (
                  <div key={entry.id} className="bg-white/60 p-3 rounded-xl border border-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-sm text-deep-slate">{routerNameById.get(entry.routerId) || 'Unknown Router'}</p>
                        <p className="text-xs text-deep-slate/50">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-deep-slate">${entry.amountUSDC.toFixed(2)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-xl text-[10px] font-bold ${entry.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {entry.status}
                        </span>
                      </div>
                    </div>
                    {entry.errorMessage && (
                      <p className="text-xs text-red-600 mt-2">{entry.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

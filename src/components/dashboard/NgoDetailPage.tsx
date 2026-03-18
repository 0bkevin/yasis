"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { getNgoById } from "@/actions/ngos";

export function NgoDetailPage({ ngoId }: { ngoId: string }) {
  const { data: ngo } = useQuery({
    queryKey: ["ngo", ngoId],
    queryFn: () => getNgoById(ngoId),
  });

  if (!ngo) {
    return <div className="p-8 text-deep-slate/60">Loading NGO...</div>;
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard/donations" className="inline-flex items-center gap-2 text-sm font-bold text-terracotta hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Donations
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/50 border border-white rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <HeartHandshake className="w-7 h-7 text-terracotta" />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40">{ngo.category}</p>
            <h1 className="text-4xl font-display font-bold text-deep-slate">{ngo.name}</h1>
          </div>
        </div>

        <p className="text-lg text-deep-slate/60 leading-relaxed max-w-3xl">{ngo.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl border border-deep-slate/10 p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-1">Impact Rate</p>
            <p className="text-2xl font-display font-bold text-deep-slate">{ngo.impactUnitPerUSDC.toFixed(2)}</p>
            <p className="text-sm text-deep-slate/55 mt-1">{ngo.impactUnitLabel} per 1 USDC</p>
          </div>
          <div className="bg-white rounded-xl border border-deep-slate/10 p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-1">Wallet</p>
            <p className="text-sm font-mono text-deep-slate/70 break-all">{ngo.walletAddress}</p>
          </div>
          <div className="bg-white rounded-xl border border-deep-slate/10 p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-1">Status</p>
            <p className="text-sm font-bold text-deep-slate/75 capitalize">{ngo.status}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

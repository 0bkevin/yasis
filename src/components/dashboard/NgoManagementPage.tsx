"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNgos, upsertNgo } from "@/actions/ngos";
import { HeartHandshake, Plus } from "lucide-react";

type NgoDraft = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  walletAddress: string;
  category: string;
  impactUnitLabel: string;
  impactUnitPerUSDC: string;
  status: "active" | "inactive";
  logoUrl?: string;
};

const emptyDraft: NgoDraft = {
  slug: "",
  name: "",
  description: "",
  walletAddress: "",
  category: "",
  impactUnitLabel: "",
  impactUnitPerUSDC: "",
  status: "active",
  logoUrl: "",
};

export function NgoManagementPage() {
  const queryClient = useQueryClient();
  const { data: ngos = [] } = useQuery({
    queryKey: ["ngos", "all"],
    queryFn: () => getAllNgos(),
  });

  const [draft, setDraft] = useState<NgoDraft>(emptyDraft);

  const mutation = useMutation({
    mutationFn: async () => upsertNgo({
      ...draft,
      impactUnitPerUSDC: Number(draft.impactUnitPerUSDC),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngos"] });
      setDraft(emptyDraft);
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-deep-slate flex items-center gap-3">
          <HeartHandshake className="w-8 h-8 text-terracotta" /> NGO Directory
        </h1>
        <p className="text-deep-slate/60 mt-3 max-w-2xl">
          Manage the curated NGO marketplace used by donation routers and impact views.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-7 bg-white/50 border border-white rounded-xl p-6">
          <h2 className="text-xl font-display font-bold text-deep-slate mb-4">Current NGOs</h2>
          <div className="space-y-3">
            {ngos.map((ngo) => (
              <button
                key={ngo.id}
                onClick={() => setDraft({
                  id: ngo.id,
                  slug: ngo.slug,
                  name: ngo.name,
                  description: ngo.description,
                  walletAddress: ngo.walletAddress,
                  category: ngo.category,
                  impactUnitLabel: ngo.impactUnitLabel,
                  impactUnitPerUSDC: ngo.impactUnitPerUSDC.toString(),
                  status: ngo.status,
                  logoUrl: ngo.logoUrl ?? "",
                })}
                className="w-full text-left bg-white rounded-xl border border-deep-slate/10 p-4 hover:border-terracotta/40 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40 mb-1">{ngo.category}</p>
                    <h3 className="font-bold text-deep-slate">{ngo.name}</h3>
                    <p className="text-sm text-deep-slate/55 mt-1">{ngo.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${ngo.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {ngo.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="xl:col-span-5 bg-white/50 border border-white rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-display font-bold text-deep-slate">{draft.id ? "Edit NGO" : "Add NGO"}</h2>
            <button onClick={() => setDraft(emptyDraft)} className="text-sm text-terracotta font-bold hover:underline inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> New
            </button>
          </div>

          {[
            ["Slug", "slug"],
            ["Name", "name"],
            ["Category", "category"],
            ["Wallet Address", "walletAddress"],
            ["Impact Unit Label", "impactUnitLabel"],
            ["Impact / USDC", "impactUnitPerUSDC"],
            ["Logo URL", "logoUrl"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-bold text-deep-slate/70 mb-1">{label}</label>
              <input
                type="text"
                value={draft[key as keyof NgoDraft] as string}
                onChange={(e) => setDraft((current) => ({ ...current, [key]: e.target.value }))}
                className="w-full border border-deep-slate/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-bold text-deep-slate/70 mb-1">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
              className="w-full border border-deep-slate/10 rounded-xl px-4 py-3 bg-white min-h-28 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-deep-slate/70 mb-1">Status</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value as "active" | "inactive" }))}
              className="w-full border border-deep-slate/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full py-4 mt-2 bg-terracotta text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : draft.id ? "Save NGO" : "Create NGO"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

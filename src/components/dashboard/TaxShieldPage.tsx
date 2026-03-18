"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Settings, History } from "lucide-react";
import { getTaxShieldConfig, getRecentTaxEvents, updateTaxShieldProfile } from "@/actions/tax-shield";

export function TaxShieldPage() {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["tax-shield", "config"],
    queryFn: () => getTaxShieldConfig(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["tax-shield", "events"],
    queryFn: () => getRecentTaxEvents(),
  });

  const [isEnabledState, setIsEnabledState] = useState<boolean | null>(null);
  const [routingPercentState, setRoutingPercentState] = useState<number | null>(null);
  const [jurisdictionState, setJurisdictionState] = useState<string | null>(null);
  const [filingFrequencyState, setFilingFrequencyState] = useState<"quarterly" | "annual" | null>(null);

  

  
  const isEnabled = isEnabledState ?? config?.profile.isEnabled ?? false;
  const routingPercent = routingPercentState ?? config?.profile.routingPercent ?? 30;
  const jurisdiction = jurisdictionState ?? config?.profile.jurisdiction ?? "US";
  const defaultFreq = config?.profile.filingFrequency === "annual" ? "annual" : "quarterly";
  const filingFrequency = filingFrequencyState ?? defaultFreq;

  const mutation = useMutation({
    mutationFn: () => updateTaxShieldProfile({
      isEnabled,
      routingPercent,
      jurisdiction,
      filingFrequency,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-shield"] });
    },
  });

  const reserve = config?.reserve;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-deep-slate flex items-center gap-3">
          <Shield className="w-8 h-8 text-terracotta" /> Tax Shield
        </h1>
        <p className="text-deep-slate/60 mt-3 max-w-2xl">
          Automatically intercept incoming deposits and quarantine a portion for your tax obligations.
          Your tax reserve stays safe, and the yield it generates flows back to your general balance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-deep-slate text-seashell rounded-xl p-6">
          <p className="text-seashell/60 text-xs font-bold uppercase tracking-wider mb-2">Protected Tax Reserve</p>
          <p className="text-4xl font-display font-bold">${reserve?.balanceUSDC.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Bonus Yield Earned</p>
          <p className="text-4xl font-display font-bold text-terracotta">${reserve?.bonusYieldEarnedUSDC.toFixed(2) ?? "0.00"}</p>
          <p className="text-xs text-deep-slate/50 mt-2 font-medium">Flows into general balance</p>
        </div>
        <div className="bg-white/60 border border-white rounded-xl p-6 flex flex-col justify-center items-start">
          <p className="text-deep-slate/40 text-xs font-bold uppercase tracking-wider mb-2">Shield Status</p>
          <span className={`px-3 py-1 rounded-xl text-sm font-bold ${isEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isEnabled ? "Active & Routing" : "Paused"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-7 bg-white/50 border border-white rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-terracotta" />
            <h2 className="text-xl font-display font-bold text-deep-slate">Routing Rules</h2>
          </div>

          <div className="bg-white rounded-xl border border-deep-slate/10 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-deep-slate/5 pb-5">
              <div>
                <p className="font-bold text-deep-slate">Enable Auto-Routing</p>
                <p className="text-sm text-deep-slate/50 mt-1">Intercept future deposits automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={(e) => setIsEnabledState(e.target.checked)} />
                <div className="w-11 h-6 bg-deep-slate/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-deep-slate/70 mb-2">Withhold Percentage: {routingPercent}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={routingPercent}
                onChange={(e) => setRoutingPercentState(Number(e.target.value))}
                className="w-full h-2 bg-misty-rose rounded-lg appearance-none cursor-pointer accent-terracotta"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-bold text-deep-slate/70 mb-2">Jurisdiction</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdictionState(e.target.value)}
                  className="w-full border border-deep-slate/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                >
                  <option value="US">United States (IRS)</option>
                  <option value="UK">United Kingdom (HMRC)</option>
                  <option value="CA">Canada (CRA)</option>
                  <option value="AU">Canada (ATO)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-deep-slate/70 mb-2">Filing Frequency</label>
                <select
                  value={filingFrequency}
                  onChange={(e) => setFilingFrequencyState(e.target.value as "quarterly" | "annual")}
                  className="w-full border border-deep-slate/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                >
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full py-4 mt-6 bg-terracotta text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="xl:col-span-5 bg-white/50 border border-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-terracotta" />
            <h2 className="text-xl font-display font-bold text-deep-slate">Tax Ledger</h2>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-deep-slate/50 text-center py-8 border-2 border-dashed border-deep-slate/10 rounded-xl">
              No tax events recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-white/60 rounded-xl p-3 border border-white">
                  <div className="flex justify-between gap-3 items-start">
                    <div>
                      <p className="font-bold text-sm text-deep-slate capitalize">{event.eventType.replace("_", " ")}</p>
                      <p className="text-xs text-deep-slate/45 mt-1">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : "-"}</p>
                    </div>
                    <p className={`font-bold ${event.eventType === 'yield_bonus' ? 'text-green-600' : 'text-terracotta'}`}>
                      {event.eventType === 'paid' ? '-' : '+'}${event.amountUSDC.toFixed(2)}
                    </p>
                  </div>
                  {event.details && <p className="text-xs text-deep-slate/60 mt-2">{event.details}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

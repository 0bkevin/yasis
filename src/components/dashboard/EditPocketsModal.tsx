"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { updateAquifers } from "@/actions/user-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";

interface AquiferData {
  id: string;
  name: string;
  type: "reserve" | "subscription" | "goal" | "shared" | "charity" | "tax";
  status: "draft" | "active" | "paused" | "completed" | "locked" | "unlocked";
  allocationPercent: number;
  targetAmountUSDC?: number | null;
  targetMonthlyOutflowUSDC?: number | null;
  targetDate?: string | null;
  unlockAt?: string | null;
  overflowMode: "compound" | "general_balance" | "donation";
  color?: string | null;
  notes?: string | null;
  requiredPrincipalSnapshotUSDC?: number | null;
  estimatedApyBps?: number | null;
}

const emptyAquifer = (): AquiferData => ({
  id: crypto.randomUUID(),
  name: "New Aquifer",
  type: "reserve",
  status: "active",
  allocationPercent: 0,
  targetAmountUSDC: null,
  targetMonthlyOutflowUSDC: null,
  targetDate: null,
  unlockAt: null,
  overflowMode: "general_balance",
  color: null,
  notes: null,
  requiredPrincipalSnapshotUSDC: null,
  estimatedApyBps: 0,
});

export function EditPocketsModal({
  isOpen,
  onClose,
  initialPockets,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPockets: AquiferData[];
}) {
  const [aquifers, setAquifers] = useState<AquiferData[]>(initialPockets.length > 0 ? initialPockets : []);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const totalPercentage = aquifers.reduce((acc, aquifer) => acc + aquifer.allocationPercent, 0);

  const mutation = useMutation({
    mutationFn: updateAquifers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-config"] });
      toast({
        type: "success",
        title: "Aquifers Saved",
        message: "Your allocation configuration has been updated.",
      });
      onClose();
    },
    onError: (e: Error) => {
      setError(e.message);
    },
  });

  const addAquifer = () => {
    setAquifers((current) => [...current, emptyAquifer()]);
  };

  const removeAquifer = (id: string) => {
    setAquifers((current) => current.filter((aquifer) => aquifer.id !== id));
  };

  const updateAquifer = (id: string, field: keyof AquiferData, value: string | number | null) => {
    setAquifers((current) => current.map((aquifer) => aquifer.id === id ? { ...aquifer, [field]: value } : aquifer));
  };

    const handleSave = () => {
    if (totalPercentage > 100) {
      setError("Total allocation cannot exceed 100%.");
      return;
    }

    const finalAquifers = [...aquifers];

    // Auto-balance if under 100%
    if (totalPercentage > 0 && totalPercentage < 100) {
      const remainder = 100 - totalPercentage;
      const reserveIndex = finalAquifers.findIndex(a => a.type === "reserve");
      
      if (reserveIndex >= 0) {
        finalAquifers[reserveIndex].allocationPercent += remainder;
      } else {
        finalAquifers.push({
          ...emptyAquifer(),
          name: "General Reserve",
          allocationPercent: remainder,
        });
      }
    }

    setError("");
    mutation.mutate(finalAquifers);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-slate/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-seashell w-full max-w-4xl rounded-xl p-4 sm:p-6 shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold">Design Your Aquifers</h2>
              <button onClick={onClose} className="p-2 hover:bg-misty-rose rounded-xl transition-colors">
                <X className="w-5 h-5 text-deep-slate/50" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
              {aquifers.map((aquifer) => (
                <div key={aquifer.id} className="bg-white p-5 rounded-xl border border-deep-slate/10 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={aquifer.name}
                        onChange={(e) => updateAquifer(aquifer.id, "name", e.target.value)}
                        className="font-bold text-lg bg-transparent border border-deep-slate/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                        placeholder="Aquifer Name"
                      />
                      <select
                        value={aquifer.type}
                        onChange={(e) => updateAquifer(aquifer.id, "type", e.target.value as AquiferData["type"])}
                        className="border border-deep-slate/10 rounded-xl px-3 py-2 bg-white"
                      >
                        <option value="reserve">Reserve</option>
                        <option value="subscription">Subscription</option>
                        <option value="goal">Goal</option>
                        <option value="shared">Shared</option>
                        <option value="charity">Giving</option>
                        <option value="tax">Tax Shield</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeAquifer(aquifer.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Allocation</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={aquifer.allocationPercent}
                          onChange={(e) => updateAquifer(aquifer.id, "allocationPercent", Number(e.target.value))}
                          className="w-full h-2 bg-misty-rose rounded-lg appearance-none cursor-pointer accent-terracotta"
                        />
                        <input
                          type="number"
                          value={aquifer.allocationPercent}
                          onChange={(e) => updateAquifer(aquifer.id, "allocationPercent", Number(e.target.value))}
                          className="w-20 bg-misty-rose/30 rounded-xl p-2 text-center font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Target Amount</label>
                      <input
                        type="number"
                        value={aquifer.targetAmountUSDC ?? ""}
                        onChange={(e) => updateAquifer(aquifer.id, "targetAmountUSDC", e.target.value ? Number(e.target.value) : null)}
                        className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Monthly Yield Goal</label>
                      <input
                        type="number"
                        value={aquifer.targetMonthlyOutflowUSDC ?? ""}
                        onChange={(e) => updateAquifer(aquifer.id, "targetMonthlyOutflowUSDC", e.target.value ? Number(e.target.value) : null)}
                        className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Planning APY %</label>
                      <input
                        type="number"
                        value={aquifer.estimatedApyBps ? aquifer.estimatedApyBps / 100 : ""}
                        onChange={(e) => updateAquifer(aquifer.id, "estimatedApyBps", e.target.value ? Number(e.target.value) * 100 : null)}
                        className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                        placeholder="e.g. 8.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Status</label>
                      <select
                        value={aquifer.status}
                        onChange={(e) => updateAquifer(aquifer.id, "status", e.target.value as AquiferData["status"])}
                        className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="locked">Locked</option>
                        <option value="unlocked">Unlocked</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Overflow</label>
                      <select
                        value={aquifer.overflowMode}
                        onChange={(e) => updateAquifer(aquifer.id, "overflowMode", e.target.value as AquiferData["overflowMode"])}
                        className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                      >
                        <option value="general_balance">General Balance</option>
                        <option value="compound">Auto-compound</option>
                        <option value="donation">Donation Route</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-deep-slate/50 mb-1">Goal Date</label>
                      <input
                        type="date"
                        value={aquifer.targetDate ?? ""}
                        onChange={(e) => updateAquifer(aquifer.id, "targetDate", e.target.value || null)}
                        className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                      />
                    </div>
                  </div>

                  <textarea
                    value={aquifer.notes ?? ""}
                    onChange={(e) => updateAquifer(aquifer.id, "notes", e.target.value)}
                    className="w-full border border-deep-slate/10 rounded-xl px-3 py-2 min-h-20 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                    placeholder="Optional notes about this aquifer's goal or behavior"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={addAquifer}
                className="w-full py-3 border-2 border-dashed border-deep-slate/20 rounded-xl text-deep-slate/60 font-bold hover:bg-white/50 hover:border-deep-slate/40 transition-all flex justify-center items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Aquifer
              </button>

                            <div className="bg-white p-4 rounded-xl border border-deep-slate/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold text-deep-slate/70">Total Allocation</span>
                  {totalPercentage < 100 && totalPercentage > 0 && (
                    <span className="text-[10px] uppercase text-deep-slate/50">Auto-balancing remaining {(100 - totalPercentage).toFixed(0)}% to Reserve</span>
                  )}
                </div>
                <span className={`font-display text-xl font-bold ${totalPercentage > 100 ? "text-red-500" : "text-green-500"}`}>
                  {totalPercentage.toFixed(0)}%
                </span>
              </div>

              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

              <button
                onClick={handleSave}
                disabled={mutation.isPending || totalPercentage > 100}
                className="w-full py-4 bg-terracotta text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#d1614a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Aquifers
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { updatePockets } from "@/actions/user-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PocketData {
  id: string;
  name: string;
  percentage: number;
}

export function EditPocketsModal({ 
  isOpen, 
  onClose, 
  initialPockets 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialPockets: PocketData[] 
}) {
  const [pockets, setPockets] = useState<PocketData[]>([]);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPockets(
        initialPockets.length > 0 
          ? [...initialPockets] 
          : [{ id: crypto.randomUUID(), name: "Liquid Spending", percentage: 100 }]
      );
      setError("");
    }
  }, [isOpen, initialPockets]);

  const totalPercentage = pockets.reduce((acc, p) => acc + p.percentage, 0);

  const mutation = useMutation({
    mutationFn: updatePockets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-config'] });
      onClose();
    },
    onError: (e: any) => {
      setError(e.message);
    }
  });

  const addPocket = () => {
    setPockets([...pockets, { id: crypto.randomUUID(), name: "New Pocket", percentage: 0 }]);
  };

  const removePocket = (id: string) => {
    setPockets(pockets.filter(p => p.id !== id));
  };

  const updatePocket = (id: string, field: keyof PocketData, value: string | number) => {
    setPockets(pockets.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError("Total allocation must equal exactly 100%");
      return;
    }
    setError("");
    mutation.mutate(pockets);
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
            className="bg-seashell w-full max-w-lg rounded-xl p-6 shadow-2xl border border-white/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold">Edit Allocations</h2>
              <button onClick={onClose} className="p-2 hover:bg-misty-rose rounded-xl transition-colors">
                <X className="w-5 h-5 text-deep-slate/50" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
              {pockets.map((pocket) => (
                <div key={pocket.id} className="bg-white p-4 rounded-xl border border-deep-slate/10 space-y-3">
                  <div className="flex justify-between items-center gap-4">
                    <input 
                      type="text" 
                      value={pocket.name}
                      onChange={(e) => updatePocket(pocket.id, 'name', e.target.value)}
                      className="font-bold text-lg bg-transparent focus:outline-none focus:border-b-2 border-terracotta w-full"
                      placeholder="Pocket Name"
                    />
                    <button 
                      onClick={() => removePocket(pocket.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" max="100" step="1"
                      value={pocket.percentage}
                      onChange={(e) => updatePocket(pocket.id, 'percentage', Number(e.target.value))}
                      className="w-full accent-terracotta"
                    />
                    <div className="flex items-center gap-1 w-20">
                      <input 
                        type="number" 
                        value={pocket.percentage}
                        onChange={(e) => updatePocket(pocket.id, 'percentage', Number(e.target.value))}
                        className="w-full bg-misty-rose/30 rounded-xl p-1 text-center font-bold"
                      />
                      <span className="font-bold text-deep-slate/50">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <button 
                onClick={addPocket}
                className="w-full py-3 border-2 border-dashed border-deep-slate/20 rounded-xl text-deep-slate/60 font-bold hover:bg-white/50 hover:border-deep-slate/40 transition-all flex justify-center items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Pocket
              </button>

              <div className="bg-white p-4 rounded-xl border border-deep-slate/10 flex justify-between items-center">
                <span className="font-bold text-deep-slate/70">Total Allocation</span>
                <span className={`font-display text-xl font-bold ${Math.abs(totalPercentage - 100) > 0.01 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalPercentage.toFixed(0)}%
                </span>
              </div>

              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

              <button 
                onClick={handleSave}
                disabled={mutation.isPending || Math.abs(totalPercentage - 100) > 0.01}
                className="w-full py-4 bg-terracotta text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#d1614a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Save, Loader2, ArrowRightLeft } from "lucide-react";
import { addYieldRouter } from "@/actions/user-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CreateRouterModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [type, setType] = useState<"subscription" | "donation">("subscription");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  
  const queryClient = useQueryClient();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setAmount("");
      setAddress("");
      setError("");
      setType("subscription");
    }
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: addYieldRouter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-config'] });
      onClose();
    },
    onError: (e: any) => {
      setError(e.message);
    }
  });

  const handleSave = () => {
    if (!name || !amount) {
      setError("Please fill in all required fields");
      return;
    }
    if (type === 'donation' && !address) {
      setError("Donations require a destination address");
      return;
    }
    
    mutation.mutate({
      id: crypto.randomUUID(),
      type,
      name,
      amountUSDC: Number(amount),
      destinationAddress: type === 'donation' ? address : undefined
    });
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
            className="bg-seashell w-full max-w-md rounded-xl p-6 shadow-2xl border border-white/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold">New Yield Router</h2>
              <button onClick={onClose} className="p-2 hover:bg-misty-rose rounded-xl transition-colors">
                <X className="w-5 h-5 text-deep-slate/50" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex p-1 bg-white border border-deep-slate/10 rounded-xl">
                <button 
                  onClick={() => setType('subscription')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${type === 'subscription' ? 'bg-misty-rose text-terracotta shadow-sm' : 'text-deep-slate/50 hover:text-deep-slate'}`}
                >
                  Internal (Subscription)
                </button>
                <button 
                  onClick={() => setType('donation')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${type === 'donation' ? 'bg-misty-rose text-terracotta shadow-sm' : 'text-deep-slate/50 hover:text-deep-slate'}`}
                >
                  External (Donation)
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-deep-slate/70 mb-1">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === 'subscription' ? "e.g. Netflix" : "e.g. GiveDirectly"}
                  className="w-full bg-white border border-deep-slate/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-deep-slate/70 mb-1">Monthly Amount (USDC)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-slate/50 font-bold">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="15.00"
                    className="w-full bg-white border border-deep-slate/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  />
                </div>
              </div>

              {type === 'donation' && (
                <div>
                  <label className="block text-sm font-bold text-deep-slate/70 mb-1">Destination Address</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-white border border-deep-slate/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button 
                onClick={handleSave}
                disabled={mutation.isPending}
                className="w-full py-4 mt-4 bg-terracotta text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#d1614a] transition-all disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
                Create Router
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

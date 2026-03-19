"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Loader2, ArrowRightLeft } from "lucide-react";
import { addYieldRouter, updateYieldRouter } from "@/actions/user-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getActiveNgos } from "@/actions/ngos";
import { useToast } from "@/components/ui/Toast";

type RouterDraft = {
  id: string;
  type: "subscription" | "donation";
  name: string;
  amountUSDC: number;
  destinationAddress?: string | null;
  ngoId?: string | null;
};

export function CreateRouterModal({
  isOpen,
  onClose,
  initialRouter,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRouter?: RouterDraft | null;
}) {
  const [type, setType] = useState<"subscription" | "donation">(initialRouter?.type ?? "subscription");
  const [name, setName] = useState(initialRouter?.name ?? "");
  const [amount, setAmount] = useState(initialRouter ? initialRouter.amountUSDC.toString() : "");
  const [address, setAddress] = useState(initialRouter?.destinationAddress ?? "");
  const [ngoId, setNgoId] = useState(initialRouter?.ngoId ?? "");
  const [error, setError] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: ngos = [] } = useQuery({
    queryKey: ["ngos", "active"],
    queryFn: () => getActiveNgos(),
  });

  const mutation = useMutation({
    mutationFn: initialRouter ? updateYieldRouter : addYieldRouter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-config"] });
      toast({
        type: "success",
        title: initialRouter ? "Router Updated" : "Router Created",
        message: "Your yield router is now active.",
      });
      onClose();
    },
    onError: (e: Error) => {
      setError(e.message);
    },
  });

  const handleSave = () => {
    if (!name.trim() || !amount) {
      setError("Please fill in all required fields");
      return;
    }

    if (type === "donation" && !address.trim() && !ngoId) {
      setError("Donations require a destination address or NGO selection");
      return;
    }

    mutation.mutate({
      id: initialRouter?.id ?? crypto.randomUUID(),
      type,
      name: name.trim(),
      amountUSDC: Number(amount),
      destinationAddress: type === "donation" ? address.trim() : undefined,
      ngoId: type === "donation" ? ngoId || null : null,
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
              <h2 className="text-2xl font-display font-bold">{initialRouter ? "Edit Yield Router" : "New Yield Router"}</h2>
              <button onClick={onClose} className="p-2 hover:bg-misty-rose rounded-xl transition-colors">
                <X className="w-5 h-5 text-deep-slate/50" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex p-1 bg-white border border-deep-slate/10 rounded-xl">
                <button
                  onClick={() => setType("subscription")}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${type === "subscription" ? "bg-misty-rose text-terracotta shadow-sm" : "text-deep-slate/50 hover:text-deep-slate"}`}
                >
                  Internal (Subscription)
                </button>
                <button
                  onClick={() => setType("donation")}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${type === "donation" ? "bg-misty-rose text-terracotta shadow-sm" : "text-deep-slate/50 hover:text-deep-slate"}`}
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
                  placeholder={type === "subscription" ? "e.g. Netflix" : "e.g. GiveDirectly"}
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

              {type === "donation" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-deep-slate/70 mb-1">Curated NGO</label>
                    <select
                      value={ngoId}
                      onChange={(e) => {
                        setNgoId(e.target.value);
                        if (e.target.value) {
                          setAddress("");
                        }
                      }}
                      className="w-full bg-white border border-deep-slate/10 rounded-xl px-4 py-3"
                    >
                      <option value="">Select NGO or use manual address</option>
                      {ngos.map((ngo) => (
                        <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-deep-slate/70 mb-1">Destination Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (e.target.value) {
                          setNgoId("");
                        }
                      }}
                      placeholder="0x..."
                      className="w-full bg-white border border-deep-slate/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                    />
                  </div>

                  {ngoId && (
                    <div className="bg-misty-rose/40 border border-misty-rose rounded-xl p-3 text-sm text-deep-slate/70">
                      Donation destination will use the selected NGO wallet automatically.
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="w-full py-4 mt-4 bg-terracotta text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#d1614a] transition-all disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
                {initialRouter ? "Save Router" : "Create Router"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import { History, ArrowDownLeft, ArrowUpRight, Plus, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserTransaction, getUserTransactions } from "@/actions/user-data";
import { useState } from "react";

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"in" | "out">("in");

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["user-transactions", "history"],
    queryFn: () => getUserTransactions(200),
  });

  const addManualTransaction = useMutation({
    mutationFn: createUserTransaction,
    onSuccess: () => {
      setTitle("");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
    },
  });

  const handleAddManualTransaction = () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    addManualTransaction.mutate({
      kind: "manual",
      title: title.trim(),
      details: "User entered transaction",
      amountUSDC: parsedAmount,
      direction,
      status: "completed",
      source: "user",
    });
  };

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
          <History className="w-8 h-8 text-terracotta" />
          History
        </h1>
        <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
          A complete ledger of deposits, sweeps, yield allocations into aquifers, and external routing events.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <h3 className="text-lg font-bold text-deep-slate mb-4">Add Manual Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g., Payroll Deposit)"
            className="md:col-span-5 bg-white border border-deep-slate/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (USDC)"
            className="md:col-span-3 bg-white border border-deep-slate/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "in" | "out")}
            className="md:col-span-2 bg-white border border-deep-slate/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          >
            <option value="in">Money In</option>
            <option value="out">Money Out</option>
          </select>
          <button
            onClick={handleAddManualTransaction}
            disabled={addManualTransaction.isPending}
            className="md:col-span-2 px-4 py-2.5 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all disabled:opacity-50"
          >
            {addManualTransaction.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-deep-slate/10 text-sm font-bold text-deep-slate/50 uppercase tracking-wider">
                <th className="p-6 font-medium">Type</th>
                <th className="p-6 font-medium">Details</th>
                <th className="p-6 font-medium">Date</th>
                <th className="p-6 font-medium text-right">Amount (USDC)</th>
                <th className="p-6 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-deep-slate/60">Loading your transactions...</td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-deep-slate/60">No transactions yet. Add one above or start using Oasis features.</td>
                </tr>
              ) : (
                txs.map((tx, i) => {
                  const isInflow = tx.direction === "in";
                  const date = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-";
                  return (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-deep-slate/5 hover:bg-white/60 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isInflow ? 'bg-green-100 text-green-600' : 'bg-misty-rose text-terracotta'}`}>
                            {isInflow ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <span className="font-bold text-deep-slate">{tx.title}</span>
                        </div>
                      </td>
                      <td className="p-6 text-deep-slate/70 font-medium">
                        {tx.details || tx.kind}
                      </td>
                      <td className="p-6 text-deep-slate/60 text-sm">{date}</td>
                      <td className="p-6 text-right">
                        <p className={`font-display font-bold text-lg ${isInflow ? 'text-green-600' : 'text-deep-slate'}`}>
                          {isInflow ? '+' : '-'}${tx.amountUSDC.toFixed(2)}
                        </p>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-xl ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserTransactions } from "@/actions/user-data";

export function TransactionHistory() {
  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["user-transactions", "recent"],
    queryFn: () => getUserTransactions(5),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-display text-deep-slate font-bold">Recent Activity</h3>
      </div>

      <p className="text-sm text-deep-slate/50 mb-5">
        Includes deposits, spare-change sweeps, yield allocations to aquifers, and donation routing events.
      </p>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-deep-slate/60 text-center py-6">Loading your recent activity...</p>
        ) : txs.length === 0 ? (
          <p className="text-sm text-deep-slate/60 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
            No activity yet. Your transactions will appear here.
          </p>
        ) : (
          txs.map((tx) => {
            const isInflow = tx.direction === "in";
            const createdAt = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-";

            return (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isInflow ? 'bg-green-100 text-green-600' : 'bg-misty-rose text-terracotta'}`}>
                    {isInflow ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-deep-slate capitalize">{tx.title}</p>
                    <p className="text-sm text-deep-slate/50">{createdAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-display ${isInflow ? 'text-green-600' : 'text-deep-slate'}`}>
                    {isInflow ? '+' : '-'}${tx.amountUSDC.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

export function TransactionHistory() {
  const { isConnected } = useAccount();

  // Mock data for MVP since we don't have an indexer configured yet
  const txs = [
    { id: 1, type: "deposit", amount: 500, date: "2024-03-14", status: "completed", hash: "0x123..." },
    { id: 2, type: "route", amount: 15, name: "Netflix Sub", date: "2024-03-10", status: "completed", hash: "0x456..." },
    { id: 3, type: "route", amount: 50, name: "GiveDirectly", date: "2024-03-01", status: "completed", hash: "0x789..." },
  ];

  if (!isConnected) return null;

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

      <div className="space-y-4">
        {txs.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white hover:bg-white transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-misty-rose text-terracotta'}`}>
                {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-deep-slate capitalize">
                  {tx.type === 'deposit' ? 'Manual Deposit' : `Routed Yield to ${tx.name}`}
                </p>
                <p className="text-sm text-deep-slate/50">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold font-display ${tx.type === 'deposit' ? 'text-green-600' : 'text-deep-slate'}`}>
                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
              <button className="text-xs text-terracotta hover:underline flex items-center justify-end gap-1 mt-1">
                View Tx <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

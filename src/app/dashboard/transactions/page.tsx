"use client";

import { motion } from "framer-motion";
import { History, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

export default function TransactionsPage() {
  const { address } = useAccount();

  // Expanded mock data
  const txs = [
    { id: 1, type: "deposit", amount: 500, date: "Mar 14, 2024", status: "completed", hash: "0x123...", title: "Manual Boost" },
    { id: 2, type: "route", amount: 15, name: "Netflix Sub", date: "Mar 10, 2024", status: "completed", hash: "0x456...", title: "Internal Yield Route" },
    { id: 3, type: "route", amount: 50, name: "GiveDirectly", date: "Mar 01, 2024", status: "completed", hash: "0x789...", title: "External Endowment" },
    { id: 4, type: "sweep", amount: 0.80, name: "Coffee", date: "Feb 28, 2024", status: "completed", hash: "0xabc...", title: "Spare Change Sweep" },
    { id: 5, type: "deposit", amount: 1000, date: "Feb 15, 2024", status: "completed", hash: "0xdef...", title: "Initial Deposit" },
  ];

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
          <History className="w-8 h-8 text-terracotta" />
          History
        </h1>
        <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
          A complete ledger of your deposits, sweeps, and automated yield routing events.
        </p>
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
              {txs.map((tx, i) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-deep-slate/5 hover:bg-white/60 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                        tx.type === 'sweep' ? 'bg-amber-100 text-amber-600' :
                        'bg-misty-rose text-terracotta'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : 
                         tx.type === 'sweep' ? <ArrowRightLeft className="w-4 h-4" /> : 
                         <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-deep-slate">{tx.title}</span>
                    </div>
                  </td>
                  <td className="p-6 text-deep-slate/70 font-medium">
                    {tx.name ? `Routed to ${tx.name}` : `From Wallet ${address?.slice(0,6)}...`}
                  </td>
                  <td className="p-6 text-deep-slate/60 text-sm">
                    {tx.date}
                  </td>
                  <td className="p-6 text-right">
                    <p className={`font-display font-bold text-lg ${tx.type === 'deposit' ? 'text-green-600' : 'text-deep-slate'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-xl">
                        Completed
                      </span>
                      <button className="text-[10px] text-deep-slate/40 group-hover:text-terracotta transition-colors flex items-center gap-1">
                        {tx.hash} <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

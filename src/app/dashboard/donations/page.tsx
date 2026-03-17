"use client";

import { motion } from "framer-motion";
import { HeartHandshake, ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { CreateRouterModal } from "@/components/dashboard/CreateRouterModal";
import { useQuery } from "@tanstack/react-query";
import { getUserConfig } from "@/actions/user-config";

export default function DonationsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { data: userConfig } = useQuery({
    queryKey: ['user-config'],
    queryFn: () => getUserConfig(),
  });

  const activeDonations = userConfig?.yieldRouters?.filter(r => r.type === 'donation') || [];
  const mockDonationHistory = [
    { id: 1, org: "GiveDirectly", amount: 50, date: "Mar 1, 2024", tx: "0x123..." },
    { id: 2, org: "Gitcoin Grants", amount: 15, date: "Feb 1, 2024", tx: "0x456..." },
  ];

  const totalDonated = 65; // Mock lifetime

  return (
    <div className="space-y-10">
      <CreateRouterModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-terracotta" />
            Endowments
          </h1>
          <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
            Automatically route a portion of your yield to causes you care about.
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> New Endowment
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <h3 className="text-2xl font-display text-deep-slate font-bold mb-6">Active Endowments</h3>
          {activeDonations.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-deep-slate/10 rounded-xl text-center">
              <HeartHandshake className="w-10 h-10 text-deep-slate/20 mx-auto mb-3" />
              <p className="text-deep-slate/60 font-medium">No active donations configured.</p>
              <p className="text-sm text-deep-slate/40 mt-1">Set up a router to start making an impact with your yield.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDonations.map(donation => (
                <div key={donation.id} className="bg-white p-6 rounded-xl border border-deep-slate/10 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg text-deep-slate mb-1">{donation.name}</h4>
                    <p className="text-sm text-deep-slate/50 font-mono">To: {donation.destinationAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-terracotta">${donation.amountUSDC.toFixed(2)}<span className="text-sm text-deep-slate/50">/mo</span></p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-xl text-xs font-bold ${donation.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {donation.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="bg-deep-slate text-seashell rounded-xl p-8">
            <p className="text-seashell/60 text-sm font-bold uppercase tracking-wider mb-2">Lifetime Impact</p>
            <p className="text-5xl font-display font-bold mb-4">${totalDonated}</p>
            <p className="text-sm text-seashell/80 leading-relaxed font-light">
              You've generated and routed real economic value simply by letting your capital sit in Oasis.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-xl p-6 border border-white">
            <h4 className="font-bold text-deep-slate mb-4">Recent Transfers</h4>
            <div className="space-y-3">
              {mockDonationHistory.map(history => (
                <div key={history.id} className="flex justify-between items-center bg-white/60 p-3 rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{history.org}</p>
                    <p className="text-xs text-deep-slate/50">{history.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-terracotta">${history.amount}</p>
                    <button className="text-[10px] text-deep-slate/50 hover:text-terracotta flex items-center justify-end gap-1">
                      {history.tx.slice(0,6)} <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

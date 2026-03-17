"use client";

import { motion } from "framer-motion";
import { Coffee, TrendingUp, RefreshCw } from "lucide-react";
import { useDeposit, useUserPosition } from "@yo-protocol/react";
import { VAULTS, parseTokenAmount } from "@yo-protocol/core";
import { useState } from "react";
import { formatUnits } from "viem";

export default function SpareChangePage() {
  const [isSweeping, setIsSweeping] = useState(false);
  const vaultAddress = VAULTS.yoUSD.address;
  const { position, refetch } = useUserPosition(vaultAddress);
  
  const { deposit } = useDeposit({
    vault: vaultAddress,
    onConfirmed: () => {
      setIsSweeping(false);
      refetch();
    },
    onError: () => setIsSweeping(false)
  });

  const handleSweepAll = async () => {
    setIsSweeping(true);
    try {
      await deposit({
        token: VAULTS.yoUSD.underlying.address[8453]!,
        amount: parseTokenAmount("5.40", 6) // Mock sum of pending sweeps
      });
    } catch (e) {
      console.error(e);
      setIsSweeping(false);
    }
  };

  const pendingSweeps = [
    { id: 1, merchant: "Starbucks", amount: 4.20, sweep: 0.80, date: "Today, 8:45 AM" },
    { id: 2, merchant: "Uber", amount: 12.40, sweep: 0.60, date: "Yesterday" },
    { id: 3, merchant: "Trader Joe's", amount: 6.50, sweep: 0.50, date: "Mar 12" },
    { id: 4, merchant: "Spotify", amount: 11.99, sweep: 0.01, date: "Mar 10" },
    { id: 5, merchant: "Whole Foods", amount: 42.15, sweep: 0.85, date: "Mar 09" },
    { id: 6, merchant: "Netflix", amount: 15.49, sweep: 0.51, date: "Mar 08" },
    { id: 7, merchant: "Local Bakery", amount: 3.75, sweep: 0.25, date: "Mar 05" },
    { id: 8, merchant: "Lyft", amount: 18.20, sweep: 0.80, date: "Mar 02" },
    { id: 9, merchant: "Amazon", amount: 34.60, sweep: 0.40, date: "Feb 28" },
    { id: 10, merchant: "Sweetgreen", amount: 28.10, sweep: 0.90, date: "Feb 26" },
  ];

  const totalSweptLifetime = 342.50;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
            <Coffee className="w-8 h-8 text-terracotta" />
            Spare Change
          </h1>
          <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
            Connect your cards to round up everyday purchases. The spare change is automatically deposited into your high-yield Oasis.
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          onClick={handleSweepAll}
          disabled={isSweeping}
          className="px-6 py-4 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} /> 
          Sweep Pending ($5.40)
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display text-deep-slate font-bold">Recent Round-Ups</h3>
              <span className="text-xs font-bold uppercase tracking-widest text-terracotta bg-misty-rose px-3 py-1 rounded-xl">Plaid Connected</span>
            </div>

            <div className="space-y-3">
              {pendingSweeps.map(sweep => (
                <div key={sweep.id} className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-white hover:bg-white transition-colors">
                  <div>
                    <p className="font-bold text-deep-slate">{sweep.merchant}</p>
                    <p className="text-xs text-deep-slate/50">{sweep.date} • Spent ${sweep.amount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg text-terracotta">+${sweep.sweep.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-deep-slate/40 uppercase tracking-wider">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-deep-slate text-seashell rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-terracotta/20 rounded-xl blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-seashell/60 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Lifetime Swept</p>
            <p className="text-5xl font-display font-bold mb-4 relative z-10">${totalSweptLifetime.toFixed(2)}</p>
            <div className="flex items-center gap-2 text-sm text-seashell/80 bg-white/10 w-max px-3 py-1.5 rounded-xl relative z-10 border border-white/5">
              <TrendingUp className="w-4 h-4 text-terracotta" />
              <span>Generating 8.5% APY</span>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-sm">
            <h4 className="font-bold text-deep-slate mb-4">How it works</h4>
            <p className="text-sm text-deep-slate/70 leading-relaxed mb-4">
              We securely monitor your connected bank accounts for purchases. Whenever you buy something, we round up to the nearest dollar and batch those cents into a single USDC deposit to minimize gas fees.
            </p>
            <p className="text-sm text-deep-slate/70 leading-relaxed">
              Your spare change immediately starts earning the highest risk-adjusted yield in DeFi.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

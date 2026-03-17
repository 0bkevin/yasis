"use client";

import { motion } from "framer-motion";
import { useVaultState, useTotalTvl } from "@yo-protocol/react";
import { Shield, TrendingUp, DollarSign } from "lucide-react";
import { formatUnits } from "viem";
import { VAULTS } from "@yo-protocol/core";

export default function ExplorePage() {
  const { vaultState, isLoading: stateLoading } = useVaultState(VAULTS.yoUSD.address);
  const { tvl, isLoading: tvlLoading } = useTotalTvl();

  const currentApy = vaultState ? ((Number(vaultState.exchangeRate) / 1e18 - 1) * 100).toFixed(2) : '8.50';

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4">
          Protocol Analytics
        </h1>
        <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
          View the global performance of the underlying yield optimization vaults.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Global TVL" 
          value={tvlLoading || !tvl ? "$14,500,000+" : `$${Number(tvl[tvl.length - 1]?.tvlUsd || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`} 
          icon={<DollarSign className="w-5 h-5" />} 
        />
        <StatCard 
          title="Average APY" 
          value={stateLoading ? "..." : `${currentApy}%`} 
          icon={<TrendingUp className="w-5 h-5" />} 
        />
        <StatCard 
          title="Risk Rating" 
          value="A+" 
          subtitle="Exponential.fi Verified"
          icon={<Shield className="w-5 h-5" />} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <h3 className="text-2xl font-display text-deep-slate font-bold mb-6">Active Strategies on Base</h3>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-deep-slate/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-lg text-deep-slate">Aave v3 USDC Supply</h4>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-xl">Active</span>
              </div>
              <p className="text-deep-slate/60 text-sm">Providing liquidity to Aave's core lending markets on Base.</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-deep-slate/50 uppercase tracking-wider mb-1">Target APY</p>
              <p className="text-2xl font-display font-bold text-terracotta">6.4%</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-deep-slate/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-lg text-deep-slate">Compound v3 USDC</h4>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-xl">Active</span>
              </div>
              <p className="text-deep-slate/60 text-sm">Supplying stablecoins to Compound's isolated lending pairs.</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-deep-slate/50 uppercase tracking-wider mb-1">Target APY</p>
              <p className="text-2xl font-display font-bold text-terracotta">8.1%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-deep-slate/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-lg text-deep-slate">Moonwell USDC</h4>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-xl">Queued</span>
              </div>
              <p className="text-deep-slate/60 text-sm">Next in line for yield optimization routing.</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-deep-slate/50 uppercase tracking-wider mb-1">Est. APY</p>
              <p className="text-2xl font-display font-bold text-deep-slate/40">7.2%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string, value: string, icon: React.ReactNode, subtitle?: string }) {
  return (
    <div className="bg-deep-slate text-seashell rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute -top-4 -right-4 p-6 opacity-10 group-hover:scale-150 transition-transform duration-700">
        {icon}
      </div>
      <p className="text-seashell/60 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">{title}</p>
      <p className="text-4xl font-display font-bold relative z-10">{value}</p>
      {subtitle && <p className="text-terracotta text-sm mt-2 font-medium relative z-10">{subtitle}</p>}
    </div>
  );
}

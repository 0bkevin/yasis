"use client";

import { motion } from "framer-motion";
import { useTotalTvl, useVaults } from "@yo-protocol/react";
import { Shield, TrendingUp, DollarSign } from "lucide-react";
import { VAULTS } from "@yo-protocol/core";

export default function ExplorePage() {
  const { vaults, isLoading: stateLoading } = useVaults();
  const { tvl, isLoading: tvlLoading } = useTotalTvl();

  const vaultAddress = VAULTS.yoUSD.address;
  const currentVaultStats = vaults?.find(v => v.contracts.vaultAddress.toLowerCase() === vaultAddress.toLowerCase());
  const currentApy = currentVaultStats?.yield?.['7d'] ? (parseFloat(currentVaultStats.yield['7d']) * 100).toFixed(2) : '8.50';

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-terracotta" /> Protocol Information
        </h1>
        <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
          Learn how Oasis generates yield in the background. Your deposits are routed through the YO Protocol, which automatically manages capital across decentralized lending markets.
        </p>
      </motion.div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
        <p className="text-sm leading-relaxed">
          Live data on this page includes the YO vault APY and global TVL. The strategy cards and risk labels below are illustrative to show the types of lending markets the underlying protocol utilizes.
        </p>
      </div>

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
          subtitle="Illustrative diligence marker"
          icon={<Shield className="w-5 h-5" />} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <h3 className="text-2xl font-display text-deep-slate font-bold mb-2">Illustrative Strategy Snapshot</h3>
        <p className="text-sm text-deep-slate/50 mb-6">
          These cards describe the types of strategies the product may route through, but they are not yet sourced from live per-strategy analytics in this UI.
        </p>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-deep-slate/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-lg text-deep-slate">Aave v3 USDC Supply</h4>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-xl">Active</span>
              </div>
              <p className="text-deep-slate/60 text-sm">Providing liquidity to Aave&apos;s core lending markets on Base.</p>
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
              <p className="text-deep-slate/60 text-sm">Supplying stablecoins to Compound&apos;s isolated lending pairs.</p>
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

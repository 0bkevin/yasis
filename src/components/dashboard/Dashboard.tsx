"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useVaultState } from "@yo-protocol/react";
import { VAULTS } from "@yo-protocol/core";
import { 
  ArrowRightLeft,
  Coffee,
  HeartHandshake,
  TrendingUp,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { isConnected } = useAccount();

  // Fetch YO Vault Data for base yoUSD vault
  const vaultAddress = VAULTS.yoUSD.address;
  const { vaultState } = useVaultState(vaultAddress);

  // Mock data for MVP read mode
  const mockTotalBalance = 5000; 
  const currentApy = vaultState ? (Number(vaultState.exchangeRate) / 1e18 - 1) * 100 : 8.5;
  const generatedYield = mockTotalBalance * (currentApy / 100) * (30/365); // 1 month of yield

  const totalWithYield = mockTotalBalance + generatedYield;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 bg-misty-rose rounded-full flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(255,228,225,0.8)] border border-white/50"
        >
          <span className="text-4xl text-terracotta font-display italic">O</span>
        </motion.div>
        <div className="space-y-4 max-w-lg">
          <h1 className="text-5xl font-display text-deep-slate leading-tight">Your quiet place<br/>for capital.</h1>
          <p className="text-lg font-sans text-deep-slate/70">
            Connect your wallet to enter Oasis.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-misty-rose rounded-full flex items-center justify-center text-terracotta font-display text-xl border border-white/60 shadow-sm">
            O
          </div>
          <h1 className="text-xl tracking-widest text-deep-slate uppercase text-sm font-semibold">Oasis</h1>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Column */}
        <div className="lg:col-span-7 space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-deep-slate/60 font-medium tracking-wide uppercase text-xs">Total Cultivated Wealth</p>
            <div className="flex items-end gap-4">
              <h2 className="text-7xl lg:text-8xl font-display text-deep-slate tracking-tight -ml-1">
                ${totalWithYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center bg-misty-rose text-terracotta px-3 py-1.5 rounded-full text-sm font-medium border border-terracotta/20 shadow-sm">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                +${generatedYield.toFixed(2)} Yield
              </span>
              <span className="text-sm text-deep-slate/60 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
                </span>
                Earning {currentApy.toFixed(2)}% APY via YO
              </span>
            </div>
          </motion.div>

          {/* Pockets Visualization */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display text-deep-slate">Your Allocations</h3>
              <button className="text-sm font-medium text-terracotta hover:text-terracotta/80 transition-colors uppercase tracking-wider">Edit</button>
            </div>

            <div className="space-y-8">
              <Pocket 
                name="Liquid Spending" 
                amount={mockTotalBalance * 0.60} 
                percent={60} 
              />
              <Pocket 
                name="Taxes (Q1)" 
                amount={mockTotalBalance * 0.25} 
                percent={25} 
              />
              <Pocket 
                name="Wealth Builder" 
                amount={mockTotalBalance * 0.15} 
                percent={15} 
              />
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Funds */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-deep-slate text-seashell rounded-[2rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150"></div>
            
            <h3 className="text-2xl font-display mb-6 relative z-10">Nourish your Oasis</h3>
            
            <button className="w-full py-4 mb-4 bg-seashell text-deep-slate rounded-2xl font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg relative z-10">
              <Plus className="w-5 h-5 text-terracotta" />
              Manual Deposit
            </button>

            <div className="mt-8 relative z-10">
              <p className="text-sm text-seashell/60 mb-4 uppercase tracking-widest">Spare Change Engine</p>
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center text-xl border border-terracotta/30">☕</div>
                  <div>
                    <p className="font-medium text-seashell">Artisan Coffee</p>
                    <p className="text-sm text-seashell/60">$4.20</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-terracotta hover:bg-terracotta/90 text-white text-sm font-medium rounded-xl transition-colors shadow-md">
                  Sweep $0.80
                </button>
              </div>
            </div>
          </motion.div>

          {/* Yield Routers */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display text-deep-slate flex items-center gap-2">
                Yield Routers
              </h3>
            </div>
            <p className="text-deep-slate/60 text-sm mb-8 leading-relaxed">
              Direct the stream of your generated yield to automate your life and impact.
            </p>

            <div className="space-y-4">
              <div className="bg-misty-rose/50 p-4 rounded-2xl border border-white flex justify-between items-center transition-all hover:bg-misty-rose/80 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm"><Coffee className="w-5 h-5 text-terracotta" /></div>
                  <div>
                    <p className="font-medium text-deep-slate">Subscriptions</p>
                    <p className="text-deep-slate/60 text-sm">$15/mo Netflix</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-deep-slate font-medium text-sm">Active</span>
                </div>
              </div>

              <div className="bg-misty-rose/50 p-4 rounded-2xl border border-white flex justify-between items-center transition-all hover:bg-misty-rose/80 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm"><HeartHandshake className="w-5 h-5 text-terracotta" /></div>
                  <div>
                    <p className="font-medium text-deep-slate">Endowment</p>
                    <p className="text-deep-slate/60 text-sm">5% to GiveDirectly</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-deep-slate font-medium text-sm">Active</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-terracotta hover:bg-[#d1614a] text-white rounded-2xl font-medium transition-all shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2">
              Route Yield <ArrowRightLeft className="w-4 h-4" />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function Pocket({ name, amount, percent }: { name: string, amount: number, percent: number }) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <span className="font-medium text-deep-slate text-lg">
          {name}
        </span>
        <span className="font-display text-2xl text-deep-slate">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="w-full h-2 bg-misty-rose rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="h-full bg-terracotta rounded-full relative" 
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 animate-[shimmer_2s_infinite]"></div>
        </motion.div>
      </div>
    </div>
  );
}
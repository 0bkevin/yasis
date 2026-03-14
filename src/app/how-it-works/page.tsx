"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ArrowRight, Zap, RefreshCw, Layers } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-seashell selection:bg-terracotta selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-seashell/80 backdrop-blur-xl border-b border-deep-slate/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-terracotta rounded flex items-center justify-center text-white font-display font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xl tracking-tighter text-deep-slate font-display font-bold">Oasis.</span>
          </Link>
          <ConnectButton label="Launch App" showBalance={false} />
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-deep-slate tracking-tight mb-6">
            The Engine Behind Oasis
          </h1>
          <p className="text-xl text-deep-slate/70 font-light leading-relaxed">
            Understanding how we use the YO Protocol SDK to turn your idle stablecoins into a self-driving financial ecosystem.
          </p>
        </motion.div>

        <div className="space-y-24">
          
          {/* Step 1 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 md:order-1 bg-white p-8 rounded-3xl border border-deep-slate/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-misty-rose/50 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex justify-between items-center bg-seashell p-4 rounded-xl border border-deep-slate/5">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-deep-slate" />
                    <span className="font-medium text-deep-slate">Your Wallet</span>
                  </div>
                  <span className="font-display font-bold">5,000 USDC</span>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-misty-rose flex items-center justify-center text-terracotta">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <div className="flex justify-between items-center bg-terracotta text-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5" />
                    <span className="font-medium">YO Protocol Vault</span>
                  </div>
                  <span className="font-display font-bold">5,000 yoUSD</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-misty-rose text-terracotta font-display font-bold text-xl mb-2">1</div>
              <h2 className="text-3xl font-display font-bold text-deep-slate">Secure Deposit via yoGateway</h2>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                When you deposit USDC into Oasis, your funds aren't held by us. Using the <strong>@yo-protocol/core</strong> SDK, your transaction is routed directly through the official <code>yoGateway</code> smart contract into the <code>yoUSD</code> vault on the Base network. You receive ERC-4626 receipt tokens representing your deposit.
              </p>
            </div>
          </motion.section>

          {/* Step 2 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-misty-rose text-terracotta font-display font-bold text-xl mb-2">2</div>
              <h2 className="text-3xl font-display font-bold text-deep-slate">Auto-Rebalancing Yield</h2>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                Once inside the YO vault, your capital never sleeps. The YO engine continuously scans DeFi (across Aave, Compound, Morpho, etc.) and automatically rebalances your funds to the pools offering the highest risk-adjusted yield. 
              </p>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                This process happens entirely on-chain without you needing to lift a finger, pay bridging fees, or monitor APY charts.
              </p>
            </div>
            <div className="bg-deep-slate p-8 rounded-3xl border border-deep-slate/10 shadow-lg relative overflow-hidden">
              <div className="flex flex-col gap-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex justify-between items-center text-white">
                  <span className="font-medium">Aave V3 (Base)</span>
                  <span className="text-sm bg-terracotta/20 text-terracotta px-2 py-1 rounded-md">4.2%</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex justify-between items-center text-white opacity-50">
                  <span className="font-medium">Compound (Base)</span>
                  <span className="text-sm bg-white/20 text-white px-2 py-1 rounded-md">3.1%</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-terracotta flex justify-between items-center text-white relative shadow-[0_0_15px_rgba(226,114,91,0.3)]">
                  <span className="font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-terracotta animate-spin-slow" />
                    Morpho Blue
                  </span>
                  <span className="text-sm bg-terracotta text-white px-2 py-1 rounded-md font-bold">8.5% APY</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Step 3 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 md:order-1 bg-white p-8 rounded-3xl border border-deep-slate/10 shadow-lg">
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-deep-slate/10">
                  <p className="text-sm text-deep-slate/60 font-medium uppercase tracking-widest mb-1">Generated Yield</p>
                  <p className="text-4xl font-display font-bold text-terracotta">+$45.00</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-deep-slate/20 rounded-full"></div>
                    <div className="flex-1 bg-seashell p-3 rounded-xl border border-deep-slate/5 flex justify-between">
                      <span className="font-medium text-deep-slate text-sm">Netflix (Subscription)</span>
                      <span className="text-terracotta font-bold text-sm">-$15.00</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-deep-slate/20 rounded-full"></div>
                    <div className="flex-1 bg-seashell p-3 rounded-xl border border-deep-slate/5 flex justify-between">
                      <span className="font-medium text-deep-slate text-sm">Charity (Endowment)</span>
                      <span className="text-terracotta font-bold text-sm">-$5.00</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-deep-slate/20 rounded-full"></div>
                    <div className="flex-1 bg-seashell p-3 rounded-xl border border-deep-slate/5 flex justify-between">
                      <span className="font-medium text-deep-slate text-sm">Wealth (Compounding)</span>
                      <span className="text-green-500 font-bold text-sm">+$25.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-misty-rose text-terracotta font-display font-bold text-xl mb-2">3</div>
              <h2 className="text-3xl font-display font-bold text-deep-slate">Programmable Profit Routing</h2>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                Because your principal is safely generating 8-10% APY, you have a constant stream of "free money." Oasis reads your vault state using <code>getVaultState()</code> and allows you to program exactly where those profits go.
              </p>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                When a router executes, we use the SDK's <code>prepareRedeem()</code> function to precisely withdraw only the yield portion of your balance, leaving your core principal untouched to continue compounding.
              </p>
            </div>
          </motion.section>

        </div>

        <div className="mt-32 text-center">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-terracotta hover:bg-deep-slate text-white rounded-xl font-medium text-lg transition-all duration-300 shadow-xl shadow-terracotta/20 hover:shadow-deep-slate/20"
          >
            Start your Oasis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </main>

    </div>
  );
}
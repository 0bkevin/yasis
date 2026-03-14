"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wallet, Blocks, Layers, Network, ArrowUpRight, Zap } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="relative min-h-screen bg-seashell selection:bg-terracotta selection:text-white" ref={containerRef}>
      
      {/* Structural Grid Background instead of blur blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute left-0 right-0 top-0 h-[500px] bg-gradient-to-b from-seashell via-seashell/90 to-transparent"></div>
        <div className="absolute left-0 right-0 bottom-0 h-[500px] bg-gradient-to-t from-seashell via-seashell/90 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-seashell/80 backdrop-blur-xl border-b border-deep-slate/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-terracotta rounded flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
              O
            </div>
            <span className="text-xl tracking-tighter text-deep-slate font-display font-bold">Oasis.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-deep-slate/70 hover:text-terracotta transition-colors text-sm font-medium hidden md:block">How it works</Link>
            <Link href="https://docs.yo.xyz" target="_blank" className="text-deep-slate/70 hover:text-terracotta transition-colors text-sm font-medium hidden md:block">YO Engine</Link>
            <ConnectButton label="Launch App" showBalance={false} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-40 lg:pt-48 pb-20">
        <div className="flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-terracotta/20 bg-misty-rose/30 mb-8"
          >
            <Zap className="w-3.5 h-3.5 text-terracotta" />
            <span className="text-xs font-bold text-terracotta tracking-widest uppercase">Powered by YO SDK v1.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[100px] font-display font-bold text-deep-slate leading-[0.95] tracking-tighter mb-8 max-w-5xl"
          >
            The self-driving <br/>
            <span className="text-terracotta relative">
              savings account.
              <svg className="absolute w-full h-4 -bottom-2 left-0 text-misty-rose -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,15 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-deep-slate/70 leading-relaxed mb-12 max-w-2xl font-light"
          >
            Deposit your stablecoins. We route them to the highest risk-adjusted yield in DeFi. Then, you set the rules for what that free money pays for.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/dashboard" 
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-terracotta hover:bg-deep-slate text-white rounded-xl font-medium text-lg transition-all duration-300 shadow-xl shadow-terracotta/20 hover:shadow-deep-slate/20"
            >
              Connect Wallet <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="https://docs.yo.xyz" 
              target="_blank"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-deep-slate/10 text-deep-slate hover:bg-misty-rose/50 rounded-xl font-medium text-lg transition-all duration-300"
            >
              Read YO Docs <ArrowUpRight className="w-4 h-4 text-deep-slate/50" />
            </Link>
          </motion.div>
        </div>

        {/* Quick summary features graphic */}
        <motion.div 
          style={{ y: y1, opacity }}
          className="mt-24 md:mt-32 relative max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-sm border border-deep-slate/10 p-6 rounded-2xl shadow-xl shadow-deep-slate/5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 bg-misty-rose rounded-xl flex items-center justify-center text-terracotta mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Non-Custodial Escrow</h3>
              <p className="text-sm text-deep-slate/70 font-light leading-relaxed">Deposit your stablecoins securely. You maintain 100% control of your funds via ERC-4626 standard smart contracts.</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm border border-deep-slate/10 p-6 rounded-2xl shadow-xl shadow-deep-slate/5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 bg-misty-rose rounded-xl flex items-center justify-center text-terracotta mb-4">
                <Blocks className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Automated Yield Engine</h3>
              <p className="text-sm text-deep-slate/70 font-light leading-relaxed">The YO Protocol continuously rebalances your capital across DeFi to secure the highest risk-adjusted APY available.</p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm border border-deep-slate/10 p-6 rounded-2xl shadow-xl shadow-deep-slate/5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 bg-misty-rose rounded-xl flex items-center justify-center text-terracotta mb-4">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Programmable Outflows</h3>
              <p className="text-sm text-deep-slate/70 font-light leading-relaxed">Set logical rules to automatically route your generated yield to pay for subscriptions, donate to charity, or auto-DCA.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-terracotta font-medium hover:text-deep-slate transition-colors group">
              See detailed technical explanation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="how-it-works" className="relative z-10 bg-white border-y border-deep-slate/10 py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 md:mb-24 text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-deep-slate tracking-tight mb-6">How Oasis Works</h2>
            <p className="text-xl text-deep-slate/60 max-w-2xl mx-auto font-light">Stop letting your idle capital lose value to inflation. Put it to work automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-misty-rose rounded-2xl flex items-center justify-center text-terracotta border border-terracotta/20 shadow-sm">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display font-bold text-deep-slate">1. Deposit Capital</h3>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                Connect your wallet and deposit USDC. Your principal remains 100% liquid and accessible at all times, secured by audited smart contracts.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-misty-rose rounded-2xl flex items-center justify-center text-terracotta border border-terracotta/20 shadow-sm">
                <Blocks className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display font-bold text-deep-slate">2. Generate Yield</h3>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                Oasis utilizes the <strong>@yo-protocol/core</strong> SDK to instantly route your funds into YO's auto-rebalancing vaults, securing the highest risk-adjusted APY in DeFi.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-14 h-14 bg-misty-rose rounded-2xl flex items-center justify-center text-terracotta border border-terracotta/20 shadow-sm">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display font-bold text-deep-slate">3. Route the Profits</h3>
              <p className="text-deep-slate/70 leading-relaxed font-light">
                Set up "Yield Routers." Tell Oasis to automatically withdraw your generated yield to pay for subscriptions, buy ETH, or donate to charity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section id="infrastructure" className="bg-deep-slate text-seashell py-20 border-b-8 border-terracotta relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-misty-rose mb-12">Built on Enterprise-Grade Infrastructure</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-80 mix-blend-luminosity">
            <span className="text-3xl font-display font-bold text-white">Base</span>
            <span className="text-3xl font-display font-bold text-white">YO Protocol</span>
            <span className="text-3xl font-display font-bold text-white">ERC-4626</span>
            <span className="text-3xl font-display font-bold text-white">Wagmi</span>
          </div>
        </div>
      </section>

    </div>
  );
}
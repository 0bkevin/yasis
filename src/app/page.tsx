"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Wallet, Blocks, Network, ArrowUpRight, Zap, ShieldCheck, Cpu, Anchor, BarChart3, Repeat, Lock, Droplets, HeartHandshake, Coins, Coffee, Shield, Target, Users, Gift, PiggyBank, TrendingUp, Receipt, Banknote, CircleDollarSign, Percent } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useAuthenticationStatus } from "@/components/providers/useAuthStatus";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const authStatus = useAuthenticationStatus();
  const { open } = useAppKit();
  const router = useRouter();
  const containerRef = useRef(null);
  const [isFullyConnected, setIsFullyConnected] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const heroY = useTransform(smoothProgress, [0, 0.2], [0, 150]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const isAuth = isConnected && authStatus === 'authenticated';
    if (isFullyConnected !== isAuth) {
      setIsFullyConnected(isAuth);
    }
  }, [isConnected, authStatus, isFullyConnected]);

  useEffect(() => {
    if (isFullyConnected) {
      router.push("/dashboard");
    }
  }, [isFullyConnected, router]);

  const handleAction = () => {
    if (isFullyConnected) {
      router.push("/dashboard");
    } else {
      open();
    }
  };

  return (
    <div className="relative min-h-screen bg-seashell selection:bg-terracotta selection:text-seashell font-sans overflow-hidden" ref={containerRef}>
      
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Fine geometric grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2F4F4F08_1px,transparent_1px),linear-gradient(to_bottom,#2F4F4F08_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-xl bg-misty-rose/40 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-xl bg-terracotta/10 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-xl bg-deep-slate/5 blur-[100px] mix-blend-multiply"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-seashell/60 backdrop-blur-2xl border-b border-deep-slate/10 transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 py-5 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-deep-slate rounded-xl flex items-center justify-center text-seashell font-display font-semibold text-xl shadow-lg shadow-deep-slate/20">
              O
            </div>
            <span className="text-2xl tracking-tight text-deep-slate font-display font-bold italic">Oasis.</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#manifesto" className="text-deep-slate/80 hover:text-terracotta transition-colors text-sm font-medium hidden md:block uppercase tracking-widest">Manifesto</Link>
            <Link href="#architecture" className="text-deep-slate/80 hover:text-terracotta transition-colors text-sm font-medium hidden md:block uppercase tracking-widest">Architecture</Link>
            <Link href="https://docs.yo.xyz" target="_blank" className="text-deep-slate/80 hover:text-terracotta transition-colors text-sm font-medium hidden md:block uppercase tracking-widest">YO Engine</Link>
            <div className="pl-4 border-l border-deep-slate/20">
              <button 
                onClick={handleAction}
                className="cursor-pointer relative group overflow-hidden px-6 py-2.5 bg-terracotta text-seashell rounded-xl flex items-center justify-center gap-3 border border-terracotta shadow-[4px_4px_0px_0px_rgba(47,79,79,1)] hover:shadow-[2px_2px_0px_0px_rgba(47,79,79,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
              >
                <div className="absolute inset-0 bg-deep-slate transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em]">{isFullyConnected ? 'Dashboard' : 'Enter Oasis'}</span>
                <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 min-h-[100svh] flex flex-col justify-center pt-24 pb-20 overflow-hidden">
        {/* Massive Background Marquee */}
        <div className="absolute top-[40%] left-0 w-full overflow-hidden -z-10 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none flex mix-blend-color-burn">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
            className="flex whitespace-nowrap"
          >
            <h1 className="text-[25vw] font-display font-bold uppercase tracking-tighter text-deep-slate">
              AUTONOMOUS YIELD • CAPITAL IN MOTION • AUTONOMOUS YIELD • CAPITAL IN MOTION • 
            </h1>
          </motion.div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Typographic Focus */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div 
              style={{ y: heroY, opacity: heroOpacity }}
              className="w-full"
            >
              <div className="inline-flex items-center gap-4 px-4 py-2 border border-deep-slate/20 rounded-xl mb-10 bg-white/20 backdrop-blur-sm">
                <div className="relative flex items-center justify-center w-3 h-3">
                  <div className="absolute inset-0 bg-terracotta rounded-xl animate-ping opacity-75"></div>
                  <div className="relative w-1.5 h-1.5 bg-terracotta rounded-xl"></div>
                </div>
                <span className="text-[10px] font-bold text-deep-slate tracking-[0.3em] uppercase">YO Engine Active</span>
              </div>
              
              <div className="relative mb-8">
                <h1 className="text-5xl sm:text-6xl md:text-[90px] lg:text-[110px] font-sans font-medium text-deep-slate leading-[0.9] tracking-tighter uppercase relative z-10">
                  <span className="block overflow-hidden pb-2"><motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="block">MONEY</motion.span></span>
                  <span className="block overflow-hidden pb-4"><motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="block font-display font-bold italic text-terracotta lowercase tracking-tight ml-8 md:ml-12">that never sleeps.</motion.span></span>
                </h1>
                {/* Structural line */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                  className="absolute -left-6 top-8 w-[2px] bg-terracotta/40 hidden md:block"
                ></motion.div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-lg md:text-2xl text-deep-slate/70 leading-relaxed max-w-xl font-light mb-12"
              >
                Your savings earn 10x more than any bank — automatically. Deposit USDC, let the YO engine optimize your yield, and route earnings wherever they matter most.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
              >
                <button 
                  onClick={handleAction}
                  className="cursor-pointer group overflow-hidden px-10 py-5 bg-deep-slate text-seashell rounded-xl flex items-center justify-between gap-8 border border-deep-slate shadow-[8px_8px_0px_0px_rgba(226,114,91,1)] hover:shadow-[4px_4px_0px_0px_rgba(226,114,91,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                >
                  <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em]">{isFullyConnected ? 'Access Dashboard' : 'Deploy Vault'}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <Link href="#architecture" className="flex items-center gap-3 px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] text-deep-slate hover:text-terracotta transition-colors group">
                  View Specs
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </motion.div>
            </motion.div>
          </div>


          {/* Right Column: Creative Visual */}
          <div className="lg:col-span-5 relative h-[400px] sm:h-[500px] md:h-[600px] w-full mt-10 lg:mt-0 flex items-center justify-center">
            
            {/* Architectural Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="w-[110%] aspect-square rounded-xl border-[1px] border-deep-slate/10"
              ></motion.div>
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="absolute w-[75%] aspect-square rounded-xl border-[1px] border-terracotta/20 border-dashed"
              ></motion.div>
              <div className="absolute w-[40%] aspect-square bg-gradient-to-tr from-terracotta/20 to-misty-rose/40 rounded-xl blur-[50px] animate-pulse"></div>
            </div>

            {/* Floating UI Composition */}
            <div className="relative z-10 w-full max-w-sm" style={{ perspective: "1200px" }}>
              
              {/* Connecting Line */}
              <motion.svg 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] pointer-events-none -z-10 hidden sm:block" 
                viewBox="0 0 200 200"
              >
                <path d="M 40 40 C 100 40, 100 160, 160 160" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta/40" strokeDasharray="6 6" />
                <circle cx="160" cy="160" r="4" className="fill-terracotta" />
              </motion.svg>

              {/* Card 1: Input */}
              <motion.div 
                initial={{ opacity: 0, y: 40, x: -20, rotateZ: -5 }}
                animate={{ opacity: 1, y: -60, x: -40, rotateZ: -2 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xl border border-white/60 p-4 sm:p-6 w-[220px] sm:w-[280px] shadow-2xl shadow-deep-slate/10 rounded-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/80 to-transparent rounded-xl blur-2xl -z-10"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="w-10 h-10 rounded-xl bg-seashell border border-deep-slate/10 flex items-center justify-center shadow-inner">
                    <Wallet className="w-5 h-5 text-deep-slate" />
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-deep-slate/5 border border-deep-slate/10 text-[10px] uppercase tracking-widest font-bold text-deep-slate/50">
                    Step 01
                  </div>
                </div>
                
                <div>
                  <div className="text-[11px] font-bold tracking-[0.2em] text-deep-slate/50 uppercase mb-2">Your Principal</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-display font-medium text-deep-slate tracking-tight">USDC</div>
                    <div className="w-2 h-2 rounded-xl bg-terracotta/50"></div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Engine */}
              <motion.div 
                initial={{ opacity: 0, y: 40, x: 20, rotateZ: 5 }}
                animate={{ opacity: 1, y: 60, x: 40, rotateZ: 2 }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 bg-deep-slate text-white p-5 sm:p-7 w-[230px] sm:w-[300px] shadow-2xl shadow-deep-slate/20 rounded-xl overflow-hidden border border-white/10"
              >
                {/* Internal Glow */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-terracotta/30 rounded-xl blur-[50px]"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center shadow-lg shadow-terracotta/30">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white flex items-center gap-2 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-xl bg-terracotta animate-pulse shadow-[0_0_8px_rgba(226,114,91,0.8)]"></div>
                    Yield Live
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-[11px] font-bold tracking-[0.2em] text-seashell/60 uppercase mb-2">Optimized APY</div>
                  <div className="text-5xl sm:text-7xl font-display font-medium text-seashell flex items-baseline gap-1 tracking-tighter">
                    14.2<span className="text-4xl text-terracotta">%</span>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-2 relative z-10">
                  <span className="text-[10px] font-bold tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-xl">AAVE</span>
                  <span className="text-[10px] font-bold tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-xl">COMPOUND</span>
                </div>
              </motion.div>

              {/* Decorative Tag */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                transition={{ 
                  opacity: { duration: 0.8, delay: 1 },
                  scale: { duration: 0.8, delay: 1 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute -top-10 sm:-top-16 right-10 bg-white/90 backdrop-blur-xl border border-white p-1 rounded-xl shadow-xl shadow-deep-slate/5"
              >
                <div className="border border-deep-slate/5 rounded-xl px-5 py-2.5 bg-seashell/50">
                  <span className="text-[11px] font-bold text-terracotta tracking-[0.2em] uppercase flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5" /> Auto-Routing
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* The Manifesto / Problem Statement */}
      <section id="manifesto" className="relative z-20 bg-deep-slate text-seashell py-32 md:py-48 rounded-t-[3rem] md:rounded-t-[5rem] overflow-hidden">
        {/* Abstract shapes in background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] rounded-xl bg-terracotta/20 blur-[150px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-xl bg-misty-rose/10 blur-[150px] mix-blend-screen"></div>
          
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="md:col-span-7"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 mb-8">
                <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">The Problem</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl lg:text-[90px] font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                IDLE CAPITAL <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">is decaying</span>
              </h2>
              <p className="text-xl md:text-2xl text-seashell/60 font-light leading-relaxed mb-8 max-w-2xl">
                Traditional finance offers fractions of a percent while extracting your value. DeFi offers massive yields but requires constant monitoring, bridging, and gas fees.
              </p>
              <p className="text-xl md:text-2xl text-seashell font-medium leading-relaxed max-w-2xl">
                Oasis bridges this gap. The current product turns decentralized yield into a guided dashboard for deposits, tracking, and configurable routing, with deeper automation still being rolled out in phases.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="md:col-span-5 relative"
            >
              <div className="aspect-square flex items-center justify-center relative p-8">
                {/* Orbital rings */}
                <div className="absolute inset-0 rounded-xl border-[1px] border-terracotta/20 border-dashed animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute inset-8 rounded-xl border-[1px] border-seashell/10 animate-[spin_40s_linear_infinite_reverse]"></div>
                <div className="absolute inset-16 rounded-xl border-[1px] border-seashell/5 animate-[spin_80s_linear_infinite]"></div>
                
                <div className="bg-deep-slate/50 backdrop-blur-3xl border border-white/10 rounded-xl p-8 w-full max-w-sm relative z-10 shadow-2xl">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-terracotta/20 rounded-xl blur-[40px]"></div>
                  
                  <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/10 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-terracotta" />
                    </div>
                    <div>
                      <h4 className="font-bold text-seashell tracking-[0.2em] uppercase text-xs mb-1">TradFi vs Oasis</h4>
                      <p className="text-seashell/50 text-[10px] uppercase tracking-widest">1 Year Projection</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8 relative z-10">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-seashell/60 text-xs font-bold uppercase tracking-widest">Legacy Savings</span>
                        <span className="font-mono text-sm">0.45%</span>
                      </div>
                      <div className="h-1.5 bg-seashell/10 rounded-xl overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "5%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-seashell/30"
                        ></motion.div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-terracotta font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Oasis Vault
                        </span>
                        <span className="font-mono text-lg text-terracotta">~14.2%</span>
                      </div>
                      <div className="h-1.5 bg-seashell/10 rounded-xl overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                          className="h-full bg-terracotta relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Architecture / How it Works */}
      <section id="architecture" className="relative z-10 bg-seashell py-32 md:py-48 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-terracotta/5 rounded-xl blur-[100px]"></div>
          <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-deep-slate/5 rounded-xl blur-[120px]"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-24 md:mb-32">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-8">
              <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">Architecture</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-[90px] font-sans font-medium text-deep-slate leading-[0.9] tracking-tighter mb-8 uppercase">
              THE ENGINE <br/>
              <span className="text-terracotta font-display italic lowercase tracking-tight">unpacked</span>
            </h2>
            <p className="text-xl md:text-2xl text-deep-slate/60 font-light max-w-2xl leading-relaxed">
              We abstract the complexity of DeFi into three primitive actions. Non-custodial today, increasingly automated over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line - Now more architectural */}
            <div className="hidden md:block absolute top-[6.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-deep-slate/10 to-transparent z-0"></div>
            <div className="hidden md:block absolute top-[6.5rem] left-[15%] right-[15%] h-[2px] bg-[linear-gradient(90deg,transparent_50%,rgba(47,79,79,0.2)_50%)] bg-[length:20px_2px] z-0"></div>

            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative z-10 group"
            >
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[150px] font-display font-bold text-deep-slate/[0.02] -z-10 group-hover:text-terracotta/[0.03] transition-colors duration-500 leading-none">01</div>
              <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-10 rounded-xl shadow-[0_20px_40px_-15px_rgba(47,79,79,0.05)] h-full hover:shadow-[0_30px_60px_-15px_rgba(47,79,79,0.1)] hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-seashell rounded-xl border border-deep-slate/10 flex items-center justify-center text-deep-slate mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Anchor className="w-8 h-8" />
                </div>
                <div className="text-[10px] font-bold text-terracotta uppercase tracking-[0.2em] mb-4">Stage One</div>
                <h3 className="text-3xl font-sans font-medium text-deep-slate mb-6 tracking-tight">Secure Principal</h3>
                <p className="text-deep-slate/60 font-light leading-relaxed mb-8 text-lg">
                  Deposit USDC into our ERC-4626 standard smart contracts. Your capital remains 100% liquid and you maintain complete custody.
                </p>
                <ul className="space-y-4 border-t border-deep-slate/10 pt-8">
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-deep-slate/70"><ShieldCheck className="w-4 h-4 text-terracotta" /> Audited Contracts</li>
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-deep-slate/70"><Lock className="w-4 h-4 text-terracotta" /> 100% Non-Custodial</li>
                </ul>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 group"
            >
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[150px] font-display font-bold text-deep-slate/[0.02] -z-10 group-hover:text-terracotta/[0.03] transition-colors duration-500 leading-none">02</div>
              <div className="bg-deep-slate text-seashell p-10 rounded-xl shadow-[0_30px_60px_-15px_rgba(47,79,79,0.3)] h-full hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-xl blur-[60px] group-hover:bg-terracotta/30 transition-colors duration-500"></div>
                <div className="w-20 h-20 bg-terracotta rounded-xl flex items-center justify-center text-white mb-10 shadow-lg shadow-terracotta/30 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="text-[10px] font-bold text-terracotta uppercase tracking-[0.2em] mb-4 relative z-10">Stage Two</div>
                <h3 className="text-3xl font-sans font-medium text-seashell mb-6 tracking-tight relative z-10">Algorithmic Yield</h3>
                <p className="text-seashell/70 font-light leading-relaxed mb-8 text-lg relative z-10">
                  Oasis currently integrates with the YO vault layer for deposits, balances, and yield visibility. More detailed strategy controls and live routing analytics are still being added to the product.
                </p>
                <ul className="space-y-4 border-t border-white/10 pt-8 relative z-10">
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-seashell/80"><Zap className="w-4 h-4 text-terracotta" /> Auto-rebalancing</li>
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-seashell/80"><Network className="w-4 h-4 text-terracotta" /> Multi-protocol</li>
                </ul>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative z-10 group"
            >
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[150px] font-display font-bold text-deep-slate/[0.02] -z-10 group-hover:text-terracotta/[0.03] transition-colors duration-500 leading-none">03</div>
              <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-10 rounded-xl shadow-[0_20px_40px_-15px_rgba(47,79,79,0.05)] h-full hover:shadow-[0_30px_60px_-15px_rgba(47,79,79,0.1)] hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-seashell rounded-xl border border-deep-slate/10 flex items-center justify-center text-deep-slate mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Repeat className="w-8 h-8" />
                </div>
                <div className="text-[10px] font-bold text-terracotta uppercase tracking-[0.2em] mb-4">Stage Three</div>
                <h3 className="text-3xl font-sans font-medium text-deep-slate mb-6 tracking-tight">Programmable Outflows</h3>
                <p className="text-deep-slate/60 font-light leading-relaxed mb-8 text-lg">
                  Define rules for your generated yield. Donation routes can already be executed from available yield, while subscription and broader automation flows remain part of the next product phases.
                </p>
                <ul className="space-y-4 border-t border-deep-slate/10 pt-8">
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-deep-slate/70"><div className="w-1.5 h-1.5 rounded-xl bg-terracotta"></div> Pay Subscriptions</li>
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-deep-slate/70"><div className="w-1.5 h-1.5 rounded-xl bg-terracotta"></div> Auto DCA</li>
                  <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-deep-slate/70"><div className="w-1.5 h-1.5 rounded-xl bg-terracotta"></div> Donations</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 1: Your Yield Dashboard */}
      <section id="feature-dashboard" className="relative z-20 bg-deep-slate text-seashell py-32 md:py-48 rounded-t-[3rem] md:rounded-t-[5rem] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-terracotta/10 blur-[120px] rounded-xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-seashell/80">Visibility</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                YOUR YIELD <br/>
                <span className="font-display italic text-terracotta lowercase tracking-tight">dashboard</span>
              </h2>
              <p className="text-xl text-seashell/60 font-light leading-relaxed max-w-xl">
                Deposit USDC, watch your yield grow in real-time, and see exactly where every dollar is working.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-terracotta/20 rounded-xl flex items-center justify-center border border-terracotta/30">
                      <Wallet className="w-6 h-6 text-terracotta" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-1">Total Balance</div>
                      <div className="text-3xl font-display text-seashell">$124,500.00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-1">Live APY</div>
                    <div className="text-2xl font-sans text-terracotta flex items-center gap-2"><TrendingUp className="w-5 h-5" /> 12.4%</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center"><CircleDollarSign className="w-4 h-4 text-blue-400" /></div>
                      <span className="text-sm font-bold tracking-widest uppercase text-seashell/80">Aave V3</span>
                    </div>
                    <span className="font-mono text-sm text-seashell/60">$82,000</span>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center"><Percent className="w-4 h-4 text-green-400" /></div>
                      <span className="text-sm font-bold tracking-widest uppercase text-seashell/80">Compound</span>
                    </div>
                    <span className="font-mono text-sm text-seashell/60">$42,500</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Aquifers */}
      <section id="feature-aquifers" className="relative z-10 bg-seashell py-32 md:py-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-terracotta/5 rounded-xl blur-[100px]"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-2 lg:order-1 relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-6 rounded-xl shadow-[0_20px_40px_-15px_rgba(47,79,79,0.05)]">
                  <Droplets className="w-8 h-8 text-terracotta mb-4" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50 mb-1">Aquifer 01</div>
                  <div className="text-lg font-sans font-medium text-deep-slate mb-4">Emergency Fund</div>
                  <div className="h-1.5 bg-deep-slate/10 rounded-xl overflow-hidden mb-2">
                    <div className="h-full bg-terracotta w-[80%]"></div>
                  </div>
                  <div className="text-xs font-mono text-deep-slate/60">$8,000 / $10k</div>
                </div>
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-6 rounded-xl shadow-[0_20px_40px_-15px_rgba(47,79,79,0.05)] translate-y-8">
                  <Target className="w-8 h-8 text-deep-slate mb-4" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50 mb-1">Aquifer 02</div>
                  <div className="text-lg font-sans font-medium text-deep-slate mb-4">Vacation</div>
                  <div className="h-1.5 bg-deep-slate/10 rounded-xl overflow-hidden mb-2">
                    <div className="h-full bg-deep-slate w-[45%]"></div>
                  </div>
                  <div className="text-xs font-mono text-deep-slate/60">$2,250 / $5k</div>
                </div>
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-6 rounded-xl shadow-[0_20px_40px_-15px_rgba(47,79,79,0.05)] col-span-2 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Coffee className="w-8 h-8 text-deep-slate/60" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50 mb-1">Aquifer 03</div>
                      <div className="text-lg font-sans font-medium text-deep-slate">Subscription Buffer</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-deep-slate/60 mb-1">$120 / mo</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Fully Funded</div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-deep-slate/60">Allocation</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase text-deep-slate">
                AQUIFERS <br/>
                <span className="font-display italic text-terracotta lowercase tracking-tight">explained</span>
              </h2>
              <p className="text-xl text-deep-slate/60 font-light leading-relaxed max-w-xl">
                Split your yield into purpose-built pools. Emergency funds, vacation savings, subscription buffers — each with its own progress tracking and overflow rules.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Route Your Yield */}
      <section id="feature-routing" className="relative z-20 bg-deep-slate text-seashell py-32 md:py-48 rounded-t-[3rem] md:rounded-t-[5rem] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-misty-rose/10 blur-[120px] rounded-xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-seashell/80">Impact</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                ROUTE YOUR <br/>
                <span className="font-display italic text-terracotta lowercase tracking-tight">yield</span>
              </h2>
              <p className="text-xl text-seashell/60 font-light leading-relaxed max-w-xl">
                Your yield works for causes you care about. Route earnings to verified NGOs with on-chain receipts, or earmark yield for monthly subscriptions.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative flex justify-center"
            >
              <div className="w-full max-w-md relative">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl w-48 text-center shadow-lg">
                    <Zap className="w-6 h-6 text-terracotta mx-auto mb-2" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/80">Generated Yield</div>
                    <div className="text-xl font-mono text-seashell">+$450.00</div>
                  </div>
                  
                  <div className="h-12 w-[2px] bg-gradient-to-b from-white/20 to-terracotta/50 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-deep-slate border border-terracotta/50 rounded-xl flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-terracotta rotate-90" />
                    </div>
                  </div>
                  
                  <div className="bg-terracotta/20 backdrop-blur-xl border border-terracotta/30 p-4 rounded-xl w-64 text-center shadow-lg shadow-terracotta/10">
                    <Repeat className="w-6 h-6 text-terracotta mx-auto mb-2" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Oasis Router</div>
                  </div>

                  <div className="flex gap-8 w-full justify-center mt-4 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-white/10 hidden sm:block"></div>
                    <div className="absolute -top-4 left-[calc(50%-4rem)] w-[2px] h-4 bg-white/10 hidden sm:block"></div>
                    <div className="absolute -top-4 right-[calc(50%-4rem)] w-[2px] h-4 bg-white/10 hidden sm:block"></div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl w-32 text-center">
                      <HeartHandshake className="w-5 h-5 text-seashell/60 mx-auto mb-2" />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/60 mb-1">NGO</div>
                      <div className="text-sm font-mono text-seashell">10%</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl w-32 text-center">
                      <Receipt className="w-5 h-5 text-seashell/60 mx-auto mb-2" />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/60 mb-1">Subs</div>
                      <div className="text-sm font-mono text-seashell">90%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Spare Change */}
      <section id="feature-sweeps" className="relative z-10 bg-seashell py-32 md:py-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-deep-slate/5 rounded-xl blur-[100px]"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-2 lg:order-1 relative"
            >
              <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-8 rounded-xl shadow-[0_20px_40px_-15px_rgba(47,79,79,0.05)] max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-deep-slate" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/60">Recent Transactions</span>
                  </div>
                  <div className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    Auto-Sweep On
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-deep-slate/5 rounded-xl flex items-center justify-center"><Coffee className="w-4 h-4 text-deep-slate/60" /></div>
                      <div>
                        <div className="text-sm font-bold text-deep-slate">Coffee Shop</div>
                        <div className="text-[10px] uppercase tracking-widest text-deep-slate/50">Today</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-deep-slate">$4.50</div>
                      <div className="text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-xl inline-block mt-1">+$0.50</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-deep-slate/5 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-deep-slate/60" /></div>
                      <div>
                        <div className="text-sm font-bold text-deep-slate">Transit</div>
                        <div className="text-[10px] uppercase tracking-widest text-deep-slate/50">Yesterday</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-deep-slate">$2.75</div>
                      <div className="text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-xl inline-block mt-1">+$0.25</div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-deep-slate text-seashell rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-deep-slate/90 transition-colors">
                  <Coins className="w-4 h-4" /> Sweep $0.75 to Vault
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-deep-slate/60">Automation</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase text-deep-slate">
                SPARE CHANGE <br/>
                <span className="font-display italic text-terracotta lowercase tracking-tight">& smart sweeps</span>
              </h2>
              <p className="text-xl text-deep-slate/60 font-light leading-relaxed max-w-xl">
                Connect your bank, round up every purchase, and sweep the spare change into your vault automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 5: Built-In Protection */}
      <section id="feature-protection" className="relative z-20 bg-deep-slate text-seashell py-32 md:py-48 rounded-t-[3rem] md:rounded-t-[5rem] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-terracotta/5 blur-[150px] rounded-xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-seashell/80">Security</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                BUILT-IN <br/>
                <span className="font-display italic text-terracotta lowercase tracking-tight">protection</span>
              </h2>
              <p className="text-xl text-seashell/60 font-light leading-relaxed">
                Tax auto-reserves, no-loss prize draws, and collaborative savings.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Shield className="w-10 h-10 text-terracotta mb-6" />
              <h3 className="text-2xl font-sans font-medium text-seashell mb-4">Tax Shield</h3>
              <p className="text-seashell/60 font-light leading-relaxed text-sm">
                Auto-reserve a configurable percentage of deposits into a protected tax reserve that earns bonus yield.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Gift className="w-10 h-10 text-terracotta mb-6" />
              <h3 className="text-2xl font-sans font-medium text-seashell mb-4">Prize Pool</h3>
              <p className="text-seashell/60 font-light leading-relaxed text-sm">
                No-loss savings lottery. Deposit principal, yield goes to prize pot, weekly draws. Principal always protected.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Users className="w-10 h-10 text-terracotta mb-6" />
              <h3 className="text-2xl font-sans font-medium text-seashell mb-4">Shared Aquifers</h3>
              <p className="text-seashell/60 font-light leading-relaxed text-sm">
                Invite-only collaborative savings pools. Track individual contributions while working towards a joint goal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visual Break / Quote */}
      <section className="py-32 border-y border-deep-slate/10 bg-white relative overflow-hidden">
        {/* Typographic background pattern */}
        <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div className="text-[300px] font-display font-bold leading-none -tracking-[0.05em] whitespace-nowrap">
            OASIS OASIS OASIS
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-12 h-12 bg-terracotta rounded-xl mx-auto mb-10"></div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans font-medium text-deep-slate leading-[1.1] tracking-tighter uppercase">
              &quot;We are transforming yield from an abstract number on a screen into a <span className="font-display italic text-terracotta lowercase tracking-tight">tangible utility.</span>&quot;
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="bg-deep-slate text-seashell py-32 relative overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-terracotta/10 rounded-t-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 border border-white/20 rounded-xl flex items-center justify-center text-seashell font-display font-bold text-4xl mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <span className="relative z-10 italic">O</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-[100px] font-sans font-medium leading-[0.9] tracking-tighter mb-10 uppercase">
            ENTER THE <span className="font-display italic text-terracotta lowercase tracking-tight">oasis.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-seashell/60 font-light max-w-2xl mb-16">
            Connect your wallet to start putting your idle capital to work. 
          </p>
          
          <button 
            onClick={handleAction}
            className="cursor-pointer relative group overflow-hidden px-12 py-6 bg-terracotta text-seashell rounded-xl flex items-center justify-center gap-6 border border-terracotta shadow-[8px_8px_0px_0px_rgba(255,245,238,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(255,245,238,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
            <span className="relative z-10 text-sm font-bold uppercase tracking-[0.2em]">{isFullyConnected ? 'Go to Dashboard' : 'Launch Application'}</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
          </button>

          <div className="w-full h-[1px] bg-white/10 mt-40 mb-10"></div>

          
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-seashell/50 tracking-[0.2em] uppercase">
            <span>© 2026 Oasis Protocol.</span>
            <div className="flex gap-10">
              <Link href="https://docs.yo.xyz" className="hover:text-terracotta transition-colors flex items-center gap-2">Documentation <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

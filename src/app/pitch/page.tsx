"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  Wallet, 
  Zap, 
  Repeat, 
  ShieldCheck, 
  TrendingUp, 
  Droplets, 
  Target, 
  Coffee, 
  HeartHandshake, 
  Receipt, 
  Banknote, 
  Coins, 
  Shield, 
  Gift, 
  Users,
  Cpu,
  Blocks,
  ArrowUpRight
} from "lucide-react";

// Slide Component
const Slide = ({ 
  children, 
  index, 
  setActiveSlide, 
  bgClass 
}: { 
  children: React.ReactNode; 
  index: number; 
  setActiveSlide: (index: number) => void;
  bgClass: string;
}) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      setActiveSlide(index);
    }
  }, [isInView, index, setActiveSlide]);

  return (
    <section 
      ref={ref} 
      className={`min-h-screen w-full snap-start snap-always flex flex-col justify-center relative overflow-hidden ${bgClass}`}
      id={`slide-${index}`}
    >
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2F4F4F08_1px,transparent_1px),linear-gradient(to_bottom,#2F4F4F08_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        {bgClass.includes('bg-seashell') ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-xl bg-misty-rose/40 blur-[120px] mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-xl bg-terracotta/10 blur-[120px] mix-blend-multiply"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] rounded-xl bg-terracotta/20 blur-[150px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-xl bg-misty-rose/10 blur-[150px] mix-blend-screen"></div>
          </>
        )}
      </div>
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-12 pb-24">
        {children}
      </div>
    </section>
  );
};

export default function PitchDeck() {
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSlides = 12;

  const scrollToSlide = (index: number) => {
    const slide = document.getElementById(`slide-${index}`);
    if (slide) {
      slide.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        if (activeSlide < totalSlides - 1) scrollToSlide(activeSlide + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeSlide > 0) scrollToSlide(activeSlide - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide]);

  return (
    <div className="bg-seashell text-deep-slate font-sans selection:bg-terracotta selection:text-seashell">
      
      {/* Slides Container */}
      <div 
        ref={containerRef}
        className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {/* SLIDE 1 — TITLE */}
        <Slide index={0} setActiveSlide={setActiveSlide} bgClass="bg-deep-slate text-seashell">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-24 h-24 bg-seashell rounded-xl flex items-center justify-center text-deep-slate font-display font-semibold text-5xl shadow-2xl shadow-terracotta/20 mb-8"
            >
              O
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl md:text-[120px] font-sans font-medium leading-[0.9] tracking-tighter uppercase mb-6"
            >
              OASIS
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-6"
            >
              Self-Driving Savings
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-seashell/60 font-light max-w-2xl mb-10"
            >
              Where idle capital becomes living infrastructure
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5"
            >
              <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">Built on YO Protocol • Base Chain • ERC-4626</span>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 2 — THE PROBLEM */}
        <Slide index={1} setActiveSlide={setActiveSlide} bgClass="bg-seashell text-deep-slate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">The Problem</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                YOUR MONEY <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">is melting.</span>
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-5xl md:text-6xl font-display font-medium text-deep-slate tracking-tighter">$305B</div>
                  <div className="text-lg text-deep-slate/60 font-light">in stablecoins earning ZERO yield for their holders</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-display font-medium text-terracotta tracking-tighter">0.45%</div>
                  <div className="text-lg text-deep-slate/60 font-light">average savings account APY, while inflation runs at 2.4%</div>
                </div>
              </div>

              <blockquote className="border-l-2 border-terracotta/40 pl-6 py-2 mb-4">
                <p className="text-xl font-display italic text-deep-slate/80 mb-4">
                  "If your savings earns less than inflation, your money is losing value every single day."
                </p>
                <footer className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50">— CNBC, Feb 2026</footer>
              </blockquote>
              
              <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/40">
                Sources: CoinDesk Research 2026, CNBC
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[350px] flex items-end justify-center"
            >
              <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-8 rounded-xl shadow-2xl flex flex-col h-full justify-end relative overflow-hidden">
                <div className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-deep-slate/50">Purchasing Power Erosion</div>
                <div className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-widest text-terracotta">-11.4% over 5 years</div>
                
                <div className="flex items-end justify-between gap-2 h-48 mt-8">
                  {[100, 95, 91, 88, 85, 82].map((val, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${val}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className={`w-full rounded-t-xl ${i === 5 ? 'bg-terracotta' : 'bg-deep-slate/20'}`}
                    >
                      <div className="text-center mt-2 text-[10px] font-bold text-deep-slate/40 absolute bottom-2 w-full opacity-0 group-hover:opacity-100">
                        Yr {i}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 3 — THE DeFi PARADOX */}
        <Slide index={2} setActiveSlide={setActiveSlide} bgClass="bg-deep-slate text-seashell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 mb-8">
                <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">The Paradox</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                DeFi YIELDS EXIST, <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">but nobody can use them.</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-4xl font-display font-medium text-seashell tracking-tighter mb-2">95%</div>
                  <div className="text-sm text-seashell/60 font-light">of DeFi liquidity sits idle and unused</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-medium text-terracotta tracking-tighter mb-2">50%</div>
                  <div className="text-sm text-seashell/60 font-light">of retail DeFi LPs lose money due to complexity</div>
                </div>
                <div className="col-span-2">
                  <div className="text-4xl font-display font-medium text-seashell tracking-tighter mb-2">$12B</div>
                  <div className="text-sm text-seashell/60 font-light">in DeFi capital going to waste</div>
                </div>
              </div>

              <blockquote className="border-l-2 border-terracotta/40 pl-6 py-2 mb-4">
                <p className="text-xl font-display italic text-seashell/80 mb-4">
                  "Everyone wants DeFi yield. Almost nobody understands the machine making it."
                </p>
                <footer className="text-[10px] font-bold uppercase tracking-widest text-seashell/50">— HackerNoon, 2026</footer>
              </blockquote>
              
              <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/40">
                Sources: 1inch Devconnect Report 2025, CoinDesk
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[400px] flex items-center justify-center"
            >
              <div className="absolute inset-0 flex">
                {/* Left: Complex */}
                <div className="w-1/2 h-full bg-black/40 border border-white/5 rounded-l-xl p-4 overflow-hidden relative opacity-50">
                  <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-red-400">Status Quo</div>
                  <div className="mt-8 space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-8 bg-white/5 rounded border border-white/10 flex items-center px-2 gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500/20"></div>
                        <div className="h-2 w-16 bg-white/10 rounded"></div>
                        <div className="h-2 w-8 bg-white/10 rounded ml-auto"></div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-8">
                    <div className="text-xs font-mono text-red-400">Gas Error: Insufficient Funds</div>
                  </div>
                </div>
                
                {/* Right: Simple */}
                <div className="w-1/2 h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-r-xl p-8 flex flex-col justify-center items-center relative shadow-2xl shadow-terracotta/10">
                  <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-terracotta">Oasis</div>
                  
                  <div className="w-20 h-20 bg-terracotta rounded-xl flex items-center justify-center shadow-lg shadow-terracotta/30 mb-6">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-display text-seashell mb-2">14.2%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-8">Auto-Optimized APY</div>
                  
                  <button className="w-full py-4 bg-seashell text-deep-slate rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors">
                    Deposit USDC
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 4 — THE SOLUTION */}
        <Slide index={3} setActiveSlide={setActiveSlide} bgClass="bg-seashell text-deep-slate">
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-8"
            >
              <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">The Solution</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-6 uppercase"
            >
              OASIS <br/>
              <span className="text-terracotta font-display italic lowercase tracking-tight">bridges the gap.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl text-deep-slate/70 font-light max-w-3xl"
            >
              We turn complex DeFi yield into a guided savings workspace anyone can use.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-10 rounded-xl shadow-xl hover:-translate-y-2 transition-transform"
            >
              <div className="w-16 h-16 bg-seashell rounded-xl border border-deep-slate/10 flex items-center justify-center text-deep-slate mb-8 shadow-inner">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-sans font-medium text-deep-slate mb-4">Deposit USDC</h3>
              <p className="text-deep-slate/60 font-light leading-relaxed">
                One-click deposit into audited ERC-4626 vaults. Your principal remains 100% liquid and non-custodial.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-deep-slate text-seashell p-10 rounded-xl shadow-2xl hover:-translate-y-2 transition-transform relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-terracotta/30 rounded-xl blur-[50px]"></div>
              <div className="w-16 h-16 bg-terracotta rounded-xl flex items-center justify-center text-white mb-8 shadow-lg shadow-terracotta/30 relative z-10">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-sans font-medium text-seashell mb-4 relative z-10">Earn ~14% APY</h3>
              <p className="text-seashell/70 font-light leading-relaxed relative z-10">
                YO Protocol auto-optimizes across Aave, Compound, and Moonwell to secure the highest risk-adjusted yield.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-10 rounded-xl shadow-xl hover:-translate-y-2 transition-transform"
            >
              <div className="w-16 h-16 bg-seashell rounded-xl border border-deep-slate/10 flex items-center justify-center text-deep-slate mb-8 shadow-inner">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-sans font-medium text-deep-slate mb-4">Route Your Yield</h3>
              <p className="text-deep-slate/60 font-light leading-relaxed">
                Donations, subscriptions, goals — your yield works for you automatically without touching your principal.
              </p>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 5 — DEMO: YIELD DASHBOARD */}
        <Slide index={4} setActiveSlide={setActiveSlide} bgClass="bg-deep-slate text-seashell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 mb-6">
                <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">Demo 01</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                YOUR WEALTH, <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">at a glance.</span>
              </h2>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-0">
                <p className="text-lg text-seashell/80 font-light leading-relaxed italic">
                  "One dashboard. Every metric. No blockchain jargon. You see your total balance, live APY, protected principal, and earned yield — all in real-time."
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-xl shadow-2xl relative">
                {/* Annotations */}
                <div className="absolute -left-12 top-12 bg-terracotta text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg hidden md:block">
                  Protected Principal
                  <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-terracotta rotate-45"></div>
                </div>
                <div className="absolute -right-12 top-32 bg-terracotta text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg hidden md:block">
                  Live APY
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-terracotta rotate-45"></div>
                </div>

                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-terracotta/20 rounded-xl flex items-center justify-center border border-terracotta/30">
                      <Wallet className="w-6 h-6 text-terracotta" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-1">Total Balance</div>
                      <div className="text-4xl font-display text-seashell">$12,450.00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-1">Live APY</div>
                    <div className="text-2xl font-sans text-terracotta flex items-center gap-2"><TrendingUp className="w-5 h-5" /> 12.4%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Principal
                    </div>
                    <div className="text-xl font-mono text-seashell">$10,000.00</div>
                  </div>
                  <div className="bg-terracotta/10 rounded-xl p-4 border border-terracotta/20">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Earned Yield
                    </div>
                    <div className="text-xl font-mono text-terracotta">+$2,450.00</div>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-32 flex items-end gap-2">
                  {[20, 35, 45, 60, 80, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                      className="flex-1 bg-terracotta/40 rounded-t-xl relative group hover:bg-terracotta transition-colors"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-deep-slate text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        M{i+1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 6 — DEMO: AQUIFERS */}
        <Slide index={5} setActiveSlide={setActiveSlide} bgClass="bg-seashell text-deep-slate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="space-y-4">
                {/* Aquifer 1 */}
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-6 rounded-xl shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-terracotta" />
                      </div>
                      <div>
                        <div className="text-lg font-sans font-medium text-deep-slate">Emergency Fund</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50">80% Progress</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-deep-slate">$8,000</div>
                      <div className="text-[10px] font-mono text-deep-slate/50">/ $10,000</div>
                    </div>
                  </div>
                  <div className="h-2 bg-deep-slate/10 rounded-xl overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: "80%" }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-terracotta"></motion.div>
                  </div>
                </div>

                {/* Aquifer 2 */}
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-6 rounded-xl shadow-lg ml-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-deep-slate/5 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-deep-slate" />
                      </div>
                      <div>
                        <div className="text-lg font-sans font-medium text-deep-slate">Vacation 2026</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50">Target: Dec 2026</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-deep-slate">$2,250</div>
                      <div className="text-[10px] font-mono text-deep-slate/50">/ $5,000</div>
                    </div>
                  </div>
                  <div className="h-2 bg-deep-slate/10 rounded-xl overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: "45%" }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-deep-slate"></motion.div>
                  </div>
                </div>

                {/* Aquifer 3 */}
                <div className="bg-deep-slate text-seashell p-6 rounded-xl shadow-xl ml-16 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-seashell" />
                      </div>
                      <div>
                        <div className="text-lg font-sans font-medium text-seashell">Netflix Subscription</div>
                        <div className="text-[10px] font-mono text-seashell/60">$15.99 / mo</div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-terracotta/20 border border-terracotta/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-terracotta">
                      Fully Funded
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-6">
                <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">Demo 02</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                AQUIFERS <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">— goal-aware savings.</span>
              </h2>
              
              <div className="bg-white/40 border border-deep-slate/10 p-6 rounded-xl">
                <p className="text-lg text-deep-slate/80 font-light leading-relaxed italic">
                  "Split your yield into purpose-built pools. Each aquifer has its own allocation percentage, overflow rules, and progress tracking. Subscription aquifers calculate exactly how much principal you need to let yield cover your bills forever."
                </p>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 7 — DEMO: YIELD ROUTING & DONATIONS */}
        <Slide index={6} setActiveSlide={setActiveSlide} bgClass="bg-deep-slate text-seashell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 mb-6">
                <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">Demo 03</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-8 uppercase">
                YOUR YIELD, <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">their impact.</span>
              </h2>
              
              <div className="mb-4">
                <div className="text-4xl font-display font-medium text-terracotta tracking-tighter mb-2">$592.5B</div>
                <div className="text-sm text-seashell/60 font-light">total US charitable giving in 2024 (Giving USA)</div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <p className="text-lg text-seashell/80 font-light leading-relaxed italic">
                  "Route your earned yield to verified NGOs with on-chain receipts. Every dollar traceable. Every impact measurable. Imagine your idle savings feeding 150 families a month — without touching your principal."
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="w-full max-w-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl w-48 text-center shadow-lg">
                    <Zap className="w-6 h-6 text-terracotta mx-auto mb-2" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/80">Yield Generated</div>
                    <div className="text-xl font-mono text-seashell">$450/mo</div>
                  </div>
                  
                  <div className="h-8 w-[2px] bg-terracotta/50"></div>
                  
                  <div className="bg-terracotta/20 backdrop-blur-xl border border-terracotta/30 p-4 rounded-xl w-64 text-center shadow-lg">
                    <Repeat className="w-6 h-6 text-terracotta mx-auto mb-2" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Oasis Router</div>
                  </div>

                  <div className="h-8 w-[2px] bg-terracotta/50"></div>

                  <div className="grid grid-cols-1 gap-3 w-full">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center"><HeartHandshake className="w-4 h-4 text-blue-400" /></div>
                        <div>
                          <div className="text-sm font-bold text-seashell">GiveDirectly NGO</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">10% Allocation</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-seashell/60">$45.00</div>
                        <div className="text-[10px] text-blue-400">150 meals funded</div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center"><Users className="w-4 h-4 text-green-400" /></div>
                        <div>
                          <div className="text-sm font-bold text-seashell">Save The Children</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">5% Allocation</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-seashell/60">$22.50</div>
                        <div className="text-[10px] text-green-400">3 classrooms</div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-terracotta/20 rounded-xl flex items-center justify-center"><Droplets className="w-4 h-4 text-terracotta" /></div>
                        <div>
                          <div className="text-sm font-bold text-seashell">Your Aquifers</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">85% Allocation</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-seashell/60">$382.50</div>
                        <div className="text-[10px] text-terracotta">Auto-compounded</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 8 — DEMO: SPARE CHANGE & TAX SHIELD */}
        <Slide index={7} setActiveSlide={setActiveSlide} bgClass="bg-seashell text-deep-slate">
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-6"
            >
              <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">Demo 04</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-6 uppercase"
            >
              SMART MONEY <br/>
              <span className="text-terracotta font-display italic lowercase tracking-tight">on autopilot.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Spare Change */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-6 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Coins className="w-6 h-6 text-terracotta" />
                <h3 className="text-2xl font-sans font-medium text-deep-slate">Spare Change</h3>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-deep-slate/5 rounded-xl flex items-center justify-center"><Coffee className="w-4 h-4 text-deep-slate/60" /></div>
                    <div className="text-sm font-bold text-deep-slate">Coffee</div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-sm font-mono text-deep-slate/60">$4.50</div>
                    <div className="text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-1 rounded-xl">+$0.50</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-deep-slate/5 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-deep-slate/60" /></div>
                    <div className="text-sm font-bold text-deep-slate">Transit</div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-sm font-mono text-deep-slate/60">$2.75</div>
                    <div className="text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-1 rounded-xl">+$0.25</div>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-deep-slate text-seashell rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                Sweep $5.40 to Vault
              </button>
            </motion.div>

            {/* Tax Shield */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-deep-slate text-seashell p-6 rounded-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/20 rounded-xl blur-[40px]"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Shield className="w-6 h-6 text-terracotta" />
                <h3 className="text-2xl font-sans font-medium text-seashell">Tax Shield</h3>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-1">Auto-Reserve</div>
                  <div className="text-2xl font-display text-seashell">30% of deposits</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-1">Protected</div>
                    <div className="text-xl font-mono text-seashell">$3,000</div>
                  </div>
                  <div className="bg-terracotta/10 p-4 rounded-xl border border-terracotta/20">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-1">Bonus Yield</div>
                    <div className="text-xl font-mono text-terracotta">+$127.50</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/40 border border-deep-slate/10 p-6 rounded-xl max-w-3xl mx-auto text-center"
          >
            <p className="text-lg text-deep-slate/80 font-light leading-relaxed italic">
              "Spare Change sweeps round up every purchase and deposit the change automatically. Tax Shield quarantines a percentage of every deposit for your tax obligations — and the reserve itself earns bonus yield."
            </p>
          </motion.div>
        </Slide>

        {/* SLIDE 9 — DEMO: PRIZE POOL & SHARED AQUIFERS */}
        <Slide index={8} setActiveSlide={setActiveSlide} bgClass="bg-deep-slate text-seashell">
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 mb-6"
            >
              <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">Demo 05</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-6 uppercase"
            >
              SAVE TOGETHER, <br/>
              <span className="text-terracotta font-display italic lowercase tracking-tight">win together.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Prize Pool */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-xl blur-[40px]"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Gift className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-sans font-medium text-seashell">Prize Pool</h3>
              </div>
              
              <div className="bg-black/20 border border-white/5 p-6 rounded-xl mb-6 text-center relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-2">This Week's Jackpot</div>
                <div className="text-4xl font-display text-yellow-500">$2,340</div>
              </div>

              <ul className="space-y-3 relative z-10">
                <li className="flex items-center gap-3 text-sm text-seashell/80"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> No-loss lottery</li>
                <li className="flex items-center gap-3 text-sm text-seashell/80"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Your principal is always protected</li>
                <li className="flex items-center gap-3 text-sm text-seashell/80"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Only yield goes to the prize pot</li>
              </ul>
            </motion.div>

            {/* Shared Aquifers */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-sans font-medium text-seashell">Shared Aquifers</h3>
              </div>

              <div className="bg-black/20 border border-white/5 p-6 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-sans font-medium text-seashell">Family Vacation Fund</div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-terracotta border-2 border-deep-slate flex items-center justify-center text-[10px] font-bold">A</div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-deep-slate flex items-center justify-center text-[10px] font-bold">B</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-deep-slate flex items-center justify-center text-[10px] font-bold">C</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-seashell/50 mb-1">Pooled Capital</div>
                <div className="text-2xl font-mono text-blue-400">$12,500</div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-seashell/80"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Invite-only collaborative savings</li>
                <li className="flex items-center gap-3 text-sm text-seashell/80"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Multi-sig withdrawal rules</li>
              </ul>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 border border-white/10 p-6 rounded-xl max-w-3xl mx-auto text-center"
          >
            <p className="text-lg text-seashell/80 font-light leading-relaxed italic">
              "Prize Pool turns savings into a no-loss lottery — deposit principal, yield funds the jackpot, someone wins weekly. Shared Aquifers let families or groups save together toward a joint goal."
            </p>
          </motion.div>
        </Slide>

        {/* SLIDE 10 — THE TEAM */}
        <Slide index={9} setActiveSlide={setActiveSlide} bgClass="bg-seashell text-deep-slate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden border-4 border-white shadow-2xl shadow-deep-slate/10 relative z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/kevin.avif" 
                    alt="Kevin Bravo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-64 h-64 md:w-80 md:h-80 rounded-xl bg-terracotta/20 -z-0"></div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50 backdrop-blur-md mb-6">
                <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">The Builder</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-2 uppercase">
                KEVIN <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">Bravo.</span>
              </h2>
              <p className="text-lg text-deep-slate/50 font-medium mb-6">Software Developer • Caracas, Venezuela</p>
              
              <div className="space-y-4 mb-8">
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50 mb-0.5">Experience</div>
                    <div className="text-sm font-medium text-deep-slate">4+ years building full-stack applications</div>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-deep-slate/5 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-deep-slate" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50 mb-0.5">Research Interests</div>
                    <div className="text-sm font-medium text-deep-slate">ZK Proofs, Cross-Chain Interoperability, Embedded Systems</div>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-xl border border-deep-slate/10 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-deep-slate/5 rounded-xl flex items-center justify-center shrink-0">
                    <Blocks className="w-5 h-5 text-deep-slate" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/50 mb-0.5">Education</div>
                    <div className="text-sm font-medium text-deep-slate">Currently pursuing an MPA</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a href="https://www.linkedin.com/in/0bkevin/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-deep-slate text-seashell rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-terracotta transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a href="https://x.com/0bkevin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-white border border-deep-slate/10 text-deep-slate rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:border-terracotta/40 hover:text-terracotta transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" /> @0bkevin
                </a>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 11 — YO SDK INTEGRATION */}
        <Slide index={10} setActiveSlide={setActiveSlide} bgClass="bg-deep-slate text-seashell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 mb-6">
                <span className="text-[10px] font-bold text-seashell/60 tracking-[0.2em] uppercase">Under the Hood</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-6 uppercase">
                POWERED BY <br/>
                <span className="text-terracotta font-display italic lowercase tracking-tight">YO Protocol.</span>
              </h2>
              <p className="text-lg text-seashell/60 font-light leading-relaxed mb-6">
                Oasis is built on two official SDK packages that handle all on-chain interactions with the YO yield vaults.
              </p>
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <p className="text-sm text-seashell/70 font-light leading-relaxed italic">
                  "We use <span className="text-terracotta font-bold not-italic">@yo-protocol/core</span> for server-side vault reads and transaction preparation, and <span className="text-terracotta font-bold not-italic">@yo-protocol/react</span> for client-side hooks that power deposits, redemptions, and real-time position tracking — all through audited ERC-4626 vaults on Base."
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-terracotta/20 border border-terracotta/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-terracotta">Core SDK</div>
                  <span className="text-[10px] font-mono text-seashell/40">@yo-protocol/core</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0"></div>
                    <span><span className="text-seashell font-medium">createApiClient()</span> — fetches vault stats, APY, TVL from YO API</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0"></div>
                    <span><span className="text-seashell font-medium">getUserPerformance()</span> — calculates realized + unrealized P&L</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0"></div>
                    <span><span className="text-seashell font-medium">VAULTS.yoUSD</span> — vault addresses, underlying tokens, decimals</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0"></div>
                    <span><span className="text-seashell font-medium">parseTokenAmount()</span> — safe USDC amount conversion (6 decimals)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-400">React SDK</div>
                  <span className="text-[10px] font-mono text-seashell/40">@yo-protocol/react</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                    <span><span className="text-seashell font-medium">YieldProvider</span> — wraps app with vault context (partnerId: 101)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                    <span><span className="text-seashell font-medium">useDeposit()</span> — full deposit lifecycle with step tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                    <span><span className="text-seashell font-medium">useRedeem()</span> — redemption with instant vs queued detection</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                    <span><span className="text-seashell font-medium">useUserPosition()</span> — real-time shares + assets tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-seashell/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                    <span><span className="text-seashell font-medium">useVaults() / useTotalTvl()</span> — live vault metrics</span>
                  </div>
                </div>
              </div>

              <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-1">Architecture</p>
                <p className="text-sm text-seashell/70">Wagmi → QueryClient → <span className="text-terracotta font-bold">YieldProvider</span> → Dashboard Hooks</p>
              </div>
            </motion.div>
          </div>
        </Slide>

        {/* SLIDE 12 — TRY IT NOW (CTA + QR) */}
        <Slide index={11} setActiveSlide={setActiveSlide} bgClass="bg-seashell text-deep-slate">
          <div className="flex flex-col items-center justify-center text-center h-full">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium leading-[0.9] tracking-tighter mb-4 uppercase"
            >
              ENTER THE <br/>
              <span className="text-terracotta font-display italic lowercase tracking-tight">oasis.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-deep-slate/60 font-light mb-8"
            >
              Scan to try the live app
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white p-4 rounded-xl shadow-2xl shadow-terracotta/20 border border-deep-slate/10 mb-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://yasis.vercel.app/&bgcolor=FFF5EE&color=2F4F4F" 
                alt="Scan to try Oasis"
                className="w-48 h-48 rounded-xl"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg font-mono text-deep-slate/80 mb-8"
            >
              yasis.vercel.app
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-deep-slate/10 bg-white/50"
            >
              <span className="text-[10px] font-bold text-deep-slate/60 tracking-[0.2em] uppercase">Built with YO Protocol • Powered by Base • ERC-4626</span>
            </motion.div>
          </div>
        </Slide>
      </div>

      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-seashell/60 backdrop-blur-xl border border-deep-slate/10 text-deep-slate/60 hover:text-terracotta hover:border-terracotta/30 transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Home
      </Link>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-seashell/80 backdrop-blur-xl border-t border-deep-slate/10 py-4 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/60 hover:text-terracotta transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-8">
            <button 
              onClick={() => activeSlide > 0 && scrollToSlide(activeSlide - 1)}
              className={`p-2 rounded-xl transition-colors ${activeSlide === 0 ? 'text-deep-slate/20 cursor-not-allowed' : 'text-deep-slate hover:bg-deep-slate/5'}`}
              disabled={activeSlide === 0}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalSlides)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSlide === i ? 'bg-terracotta w-6' : 'bg-deep-slate/20 hover:bg-deep-slate/40'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={() => activeSlide < totalSlides - 1 && scrollToSlide(activeSlide + 1)}
              className={`p-2 rounded-xl transition-colors ${activeSlide === totalSlides - 1 ? 'text-deep-slate/20 cursor-not-allowed' : 'text-deep-slate hover:bg-deep-slate/5'}`}
              disabled={activeSlide === totalSlides - 1}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-deep-slate/60 font-mono">
            {String(activeSlide + 1).padStart(2, '0')} / {totalSlides}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Wallet, Blocks, Network, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="relative min-h-screen bg-seashell selection:bg-terracotta selection:text-white">
      {/* Structural Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-seashell/80 backdrop-blur-xl border-b border-deep-slate/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-misty-rose rounded-xl flex items-center justify-center text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xl tracking-tighter text-deep-slate font-display font-bold">Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-40 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-terracotta/20 bg-misty-rose/30 mb-6">
            <Zap className="w-3.5 h-3.5 text-terracotta" />
            <span className="text-xs font-bold text-terracotta tracking-widest uppercase">Technical Overview</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-deep-slate tracking-tighter mb-6">
            How Oasis Works.
          </h1>
          <p className="text-xl text-deep-slate/70 font-light leading-relaxed">
            A deep dive into the self-driving savings account architecture. Oasis bridges the gap between complex DeFi yield strategies and everyday financial utility.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          <StepCard 
            number="01"
            icon={<Wallet className="w-6 h-6 text-terracotta" />}
            title="Non-Custodial Escrow"
            description="When you deposit USDC into Oasis, you are interacting with an ERC-4626 standard smart contract on the Base network. Oasis never holds your private keys and cannot access your funds. The protocol simply acts as an interface layer routing your capital into the underlying YO Protocol vaults."
          />

          <StepCard 
            number="02"
            icon={<Blocks className="w-6 h-6 text-terracotta" />}
            title="Automated Yield Engine (@yo-protocol)"
            description="Your deposited capital is routed into the YO vault integration used by Oasis. The current app surfaces live YO position and vault metrics, while deeper strategy-by-strategy controls and analytics are still being expanded in the product experience."
          />

          <StepCard 
            number="03"
            icon={<Network className="w-6 h-6 text-terracotta" />}
            title="Programmable Outflows"
            description="As your principal generates yield, Oasis tracks accrued value and lets you configure Yield Routers. In the current app, donation routers can be executed using available yield, while subscription routers act as planning targets until automated merchant payout flows are built."
          />

          <StepCard 
            number="04"
            icon={<Shield className="w-6 h-6 text-terracotta" />}
            title="Enterprise Security via SIWE"
            description="To protect your mental accounting (Pockets) and Yield Router configurations, Oasis uses Sign-In With Ethereum (SIWE). This cryptographic standard ensures that only the verifiable owner of the wallet can modify the routing rules, preventing impersonation attacks while storing preferences securely in a Turso edge database."
          />

        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 p-8 bg-deep-slate text-seashell rounded-xl text-center"
        >
          <h3 className="text-3xl font-display font-bold mb-4">Ready to start earning?</h3>
          <p className="text-seashell/60 mb-8 max-w-lg mx-auto">Connect your wallet and make your first deposit into the YO-powered escrow.</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-terracotta hover:bg-white text-white hover:text-deep-slate rounded-xl font-medium text-lg transition-all duration-300"
          >
            Launch App
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="bg-white/60 backdrop-blur-sm p-8 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 text-8xl font-display font-bold text-deep-slate/[0.02] group-hover:text-deep-slate/[0.05] transition-colors pointer-events-none select-none">
        {number}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
        <div className="p-4 bg-misty-rose rounded-xl shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-deep-slate mb-3">{title}</h3>
          <p className="text-deep-slate/70 leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

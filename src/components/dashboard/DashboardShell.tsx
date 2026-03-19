"use client";

import { useAccount } from "wagmi";
import { useAuthenticationStatus } from "@/components/providers/useAuthStatus";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {  LayoutDashboard, WalletCards, HeartHandshake, History, Coffee, Shield, Trophy , Info } from "lucide-react";
import { ToastContainer } from "@/components/ui/Toast";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const authStatus = useAuthenticationStatus();
  const pathname = usePathname();

  if (!isConnected || authStatus !== 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-misty-rose rounded-xl flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(255,228,225,0.8)] border border-white/50"
        >
          <span className="text-4xl text-terracotta font-display italic">O</span>
        </motion.div>
        <div className="space-y-4 max-w-lg">
          <h1 className="text-5xl font-display text-deep-slate leading-tight font-bold">Your quiet place<br/>for capital.</h1>
          <p className="text-lg font-sans text-deep-slate/70">
            Connect and sign in to enter Oasis.
          </p>
        </div>
        <appkit-button />
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
    { name: 'Aquifers', href: '/dashboard/aquifers', icon: <WalletCards className="w-4 h-4" /> },
    { name: 'Prize Pool', href: '/dashboard/prize-pool', icon: <Trophy className="w-4 h-4" /> },
    { name: 'Tax Shield', href: '/dashboard/tax-shield', icon: <Shield className="w-4 h-4" /> },
    { name: 'Donations', href: '/dashboard/donations', icon: <HeartHandshake className="w-4 h-4" /> },
    { name: 'Spare Change', href: '/dashboard/spare-change', icon: <Coffee className="w-4 h-4" /> },
    { name: 'History', href: '/dashboard/transactions', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-8 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-misty-rose rounded-xl flex items-center justify-center text-terracotta font-display text-xl border border-white/60 shadow-sm font-bold">
              O
            </div>
            <h1 className="text-xl tracking-widest text-deep-slate uppercase text-sm font-semibold">Oasis</h1>
          </Link>
          <div className="flex md:hidden items-center gap-3">
            <Link href="/dashboard/explore" className="p-2 bg-white/60 hover:bg-white border border-deep-slate/10 rounded-xl transition-all text-deep-slate/50 hover:text-terracotta shadow-sm" title="Protocol Information">
              <Info className="w-4 h-4" />
            </Link>
            <appkit-button />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard/explore" className="p-2.5 bg-white/60 hover:bg-white border border-deep-slate/10 rounded-xl transition-all text-deep-slate/50 hover:text-terracotta shadow-sm" title="Protocol Information">
            <Info className="w-4 h-4" />
          </Link>
          <appkit-button />
        </div>
      </header>

      {/* Navigation */}
      <nav className="mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-deep-slate text-seashell shadow-md' 
                    : 'bg-white/60 text-deep-slate/60 hover:bg-white hover:text-deep-slate border border-transparent hover:border-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      <ToastContainer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Loader2, Plus, RefreshCw, Link as LinkIcon, Coffee, TrendingUp } from "lucide-react";
import { getLinkedAccounts, connectMockAccount, triggerMockSync, getRecentSyncRuns } from "@/actions/spare-change";
import { getSpareBankTransactions, markSpareTransactionsSwept } from "@/actions/user-data";
import { motion } from "framer-motion";
import { useDeposit, useUserPosition, useVaults } from "@yo-protocol/react";
import { VAULTS, parseTokenAmount } from "@yo-protocol/core";
import { useAccount, useSwitchChain } from "wagmi";

export default function SpareChangePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"connected" | "sandbox">("connected");
  const [institutionName, setInstitutionName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Sandbox state
  const [isSweeping, setIsSweeping] = useState(false);
  const vaultAddress = VAULTS.yoUSD.address;
  const { refetch } = useUserPosition(vaultAddress);
  const { vaults } = useVaults();
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const currentVaultStats = vaults?.find(v => v.contracts.vaultAddress.toLowerCase() === vaultAddress.toLowerCase());
  const currentApy = currentVaultStats?.yield?.['7d'] ? (parseFloat(currentVaultStats.yield['7d']) * 100).toFixed(2) : '0.00';
  
  const { deposit } = useDeposit({
    vault: vaultAddress,
    onConfirmed: () => {
      setIsSweeping(false);
      refetch();
    },
    onError: () => setIsSweeping(false)
  });

  const handleSweepAll = async () => {
    if (chainId !== 8453) {
      switchChain({ chainId: 8453 });
      return;
    }
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

  const { data: accounts = [] } = useQuery({
    queryKey: ["linked-accounts"],
    queryFn: () => getLinkedAccounts(),
  });

  const { data: syncRuns = [] } = useQuery({
    queryKey: ["sync-runs"],
    queryFn: () => getRecentSyncRuns(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["spare-transactions"],
    queryFn: () => getSpareBankTransactions(),
  });

  const connectMutation = useMutation({
    mutationFn: (name: string) => connectMockAccount(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linked-accounts"] });
      setInstitutionName("");
      setIsConnecting(false);
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => triggerMockSync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linked-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["sync-runs"] });
      queryClient.invalidateQueries({ queryKey: ["spare-transactions"] });
    },
  });

  const sweepMutation = useMutation({
    mutationFn: (ids: string[]) => markSpareTransactionsSwept(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spare-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["user-wealth"] });
    },
  });

  const pendingRealTransactions = transactions.filter(t => !t.isDemo && t.status === "pending");
  const realTotalRoundUp = pendingRealTransactions.reduce((acc, t) => acc + t.roundUpAmount, 0);

  const handleRealSweep = async () => {
    if (chainId !== 8453) {
      switchChain({ chainId: 8453 });
      return;
    }
    if (pendingRealTransactions.length === 0) return;
    setIsSweeping(true);
    try {
      await deposit({
        token: VAULTS.yoUSD.underlying.address[8453]!,
        amount: parseTokenAmount(realTotalRoundUp.toFixed(6), 6)
      });
      await sweepMutation.mutateAsync(pendingRealTransactions.map(t => t.id));
    } catch (e) {
      console.error(e);
      setIsSweeping(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-deep-slate flex items-center gap-3">
          <Coins className="w-8 h-8 text-terracotta" /> Spare Change
        </h1>
        <p className="text-deep-slate/60 mt-3 max-w-2xl">
          Connect your accounts to automatically round up daily purchases and sweep the spare change into Oasis to start generating yield.
        </p>
      </div>

      <div className="flex border-b border-deep-slate/10 gap-6">
        <button
          onClick={() => setActiveTab("connected")}
          className={`pb-3 font-bold transition-colors ${activeTab === "connected" ? "text-terracotta border-b-2 border-terracotta" : "text-deep-slate/50 hover:text-deep-slate"}`}
        >
          Connected Accounts
        </button>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`pb-3 font-bold transition-colors ${activeTab === "sandbox" ? "text-terracotta border-b-2 border-terracotta" : "text-deep-slate/50 hover:text-deep-slate"}`}
        >
          Sandbox Mode
        </button>
      </div>

      {activeTab === "connected" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white/50 border border-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-deep-slate">Linked Institutions</h2>
                <button
                  onClick={() => setIsConnecting(!isConnecting)}
                  className="text-sm font-bold text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  {isConnecting ? "Cancel" : <><Plus className="w-4 h-4" /> Add Account</>}
                </button>
              </div>

              {isConnecting && (
                <div className="bg-white rounded-xl border border-deep-slate/10 p-5 mb-6 flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-deep-slate/50 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Chase, Bank of America"
                      className="w-full bg-white/50 border border-deep-slate/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => connectMutation.mutate(institutionName || "Test Bank")}
                    disabled={connectMutation.isPending}
                    className="px-6 py-3 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg disabled:opacity-50"
                  >
                    {connectMutation.isPending ? "Connecting..." : "Connect"}
                  </button>
                </div>
              )}

              {accounts.length === 0 && !isConnecting ? (
                <p className="text-sm text-deep-slate/50 text-center py-8 border-2 border-dashed border-deep-slate/10 rounded-xl">
                  No accounts linked yet. Add a bank or credit card to begin.
                </p>
              ) : (
                <div className="space-y-4">
                  {accounts.map(acc => (
                    <div key={acc.id} className="bg-white rounded-xl border border-deep-slate/10 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-misty-rose/40 p-3 rounded-xl">
                          <LinkIcon className="w-5 h-5 text-terracotta" />
                        </div>
                        <div>
                          <h3 className="font-bold text-deep-slate">{acc.institutionName}</h3>
                          <p className="text-sm text-deep-slate/55">Account {acc.accountMask} • <span className="capitalize">{acc.status}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-deep-slate/40">Last Sync</p>
                          <p className="text-xs text-deep-slate/70">{acc.lastSyncAt ? new Date(acc.lastSyncAt).toLocaleString() : "Never"}</p>
                        </div>
                        <button
                          onClick={() => syncMutation.mutate(acc.id)}
                          disabled={syncMutation.isPending}
                          className="p-2 bg-deep-slate/5 hover:bg-deep-slate/10 rounded-xl transition-colors disabled:opacity-50"
                          title="Trigger sync"
                        >
                          <RefreshCw className={`w-5 h-5 text-deep-slate/60 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/50 border border-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-deep-slate">Pending Real Round-Ups</h2>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-deep-slate/40 tracking-wider">Ready to Sweep</p>
                  <p className="text-2xl font-display font-bold text-terracotta">${realTotalRoundUp.toFixed(2)}</p>
                </div>
              </div>
              
              {pendingRealTransactions.length === 0 ? (
                 <p className="text-sm text-deep-slate/50 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                 No pending real transactions to sweep.
               </p>
              ) : (
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                  {pendingRealTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-deep-slate/5">
                      <div>
                        <p className="font-bold text-sm text-deep-slate">{tx.merchant}</p>
                        <p className="text-xs text-deep-slate/50">
                          {tx.occurredAt ? new Date(tx.occurredAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-deep-slate/60 line-through">${tx.amount.toFixed(2)}</p>
                        <p className="font-bold text-terracotta">+${tx.roundUpAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                disabled={chainId === 8453 && (pendingRealTransactions.length === 0 || isSweeping || sweepMutation.isPending)}
                onClick={handleRealSweep}
                className="w-full py-4 bg-terracotta hover:bg-[#d1614a] text-white rounded-xl font-bold transition-all shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                {chainId !== 8453 ? (
                  <>Switch to Base</>
                ) : (
                  <>
                    {isSweeping || sweepMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Sweep ${realTotalRoundUp.toFixed(2)} to Vault
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white/50 border border-white rounded-xl p-6">
              <h2 className="text-xl font-display font-bold text-deep-slate mb-4">Sync History</h2>
              {syncRuns.length === 0 ? (
                <p className="text-sm text-deep-slate/50 text-center py-6 border-2 border-dashed border-deep-slate/10 rounded-xl">
                  No sync runs yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {syncRuns.map(run => (
                    <div key={run.id} className="bg-white rounded-xl p-3 border border-deep-slate/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${run.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {run.status}
                        </span>
                        <span className="text-xs text-deep-slate/50">{run.createdAt ? new Date(run.createdAt).toLocaleString() : ""}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-medium text-deep-slate">{run.transactionsFound} txs found</p>
                        <p className="text-sm font-bold text-terracotta">+${run.roundUpGeneratedUSDC.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "sandbox" && (
        <div className="space-y-10 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
                <Coffee className="w-8 h-8 text-terracotta" />
                Sandbox Sweep
              </h1>
              <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
                Test the sweep mechanic with mock data before connecting real accounts.
              </p>
            </motion.div>
            
            <motion.button 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              onClick={handleSweepAll}
              disabled={chainId === 8453 && isSweeping}
              className="px-6 py-4 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg disabled:opacity-50"
            >
              {chainId !== 8453 ? (
                <>Switch to Base</>
              ) : (
                <>
                  <RefreshCw className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} /> 
                  Sweep Pending ($5.40)
                </>
              )}
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
                  <h3 className="text-xl font-display text-deep-slate font-bold">Mock Round-Ups</h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-terracotta bg-misty-rose px-3 py-1 rounded-xl">Sandbox Data</span>
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
                <p className="text-seashell/60 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Lifetime Swept (Mock)</p>
                <p className="text-5xl font-display font-bold mb-4 relative z-10">${totalSweptLifetime.toFixed(2)}</p>
                <div className="flex items-center gap-2 text-sm text-seashell/80 bg-white/10 w-max px-3 py-1.5 rounded-xl relative z-10 border border-white/5">
                  <TrendingUp className="w-4 h-4 text-terracotta" />
                  <span>Generating {currentApy}% APY</span>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-xl p-8 border border-white shadow-sm">
                <h4 className="font-bold text-deep-slate mb-4">Sandbox Mode</h4>
                <p className="text-sm text-deep-slate/70 leading-relaxed mb-4">
                  This interface uses static mock data to demonstrate the sweeping interface. When you press Sweep, it executes a real deposit transaction on Base using testnet tokens.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

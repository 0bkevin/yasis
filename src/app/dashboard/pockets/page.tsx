"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getUserConfig } from "@/actions/user-config";
import { EditPocketsModal } from "@/components/dashboard/EditPocketsModal";
import { useState, useMemo } from "react";
import { Plus, WalletCards, Settings } from "lucide-react";
import { Pocket } from "@/components/dashboard/DashboardOverview";
import { useVaultState, useUserPosition } from "@yo-protocol/react";
import { VAULTS } from "@yo-protocol/core";
import { formatUnits } from "viem";

export default function PocketsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { data: userConfig } = useQuery({
    queryKey: ['user-config'],
    queryFn: () => getUserConfig(),
  });

  const vaultAddress = VAULTS.yoUSD.address;
  const { position } = useUserPosition(vaultAddress);
  
  const totalAssets = useMemo(() => {
    if (!position) return 0;
    return Number(formatUnits(position.assets, 6));
  }, [position]);

  const displayBalance = totalAssets === 0 ? 5000 : totalAssets;

  const pockets = userConfig?.pockets && userConfig.pockets.length > 0 
    ? userConfig.pockets 
    : [
        { id: '1', name: "Liquid Spending", percentage: 60 },
        { id: '2', name: "Taxes (Q1)", percentage: 25 },
        { id: '3', name: "Wealth Builder", percentage: 15 }
      ];

  return (
    <div className="space-y-10">
      <EditPocketsModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        initialPockets={userConfig?.pockets || []} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display text-deep-slate tracking-tighter font-bold mb-4 flex items-center gap-3">
            <WalletCards className="w-8 h-8 text-terracotta" />
            Pockets
          </h1>
          <p className="text-lg text-deep-slate/60 font-light max-w-2xl">
            Mental accounting for your idle capital. Visualize exactly how your wealth is distributed without moving funds on-chain.
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d1614a] transition-all shadow-lg"
        >
          <Settings className="w-4 h-4" /> Edit Allocations
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pockets.map((pocket, i) => (
          <motion.div 
            key={pocket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/60 backdrop-blur-xl rounded-xl p-8 border border-white shadow-sm hover:shadow-md transition-shadow"
          >
            <Pocket 
              name={pocket.name} 
              amount={displayBalance * (pocket.percentage / 100)} 
              percent={pocket.percentage} 
            />
            <div className="mt-8 flex justify-between items-center text-sm font-bold text-deep-slate/50">
              <span>{pocket.percentage}% of total</span>
              <span>Vault: yoUSD</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

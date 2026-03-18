import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { aquifers, userTransactions } from "@/db/schema";
import { createApiClient, getUserPerformance } from "@yo-protocol/core";
import { VAULTS } from "@yo-protocol/core";

const api = createApiClient();

function roundUSDC(value: number) {
  return Number(value.toFixed(2));
}

export interface WealthSnapshot {
  principalDeposited: number;
  principalWithdrawn: number;
  protectedPrincipal: number;
  currentVaultBalance: number;
  earnedYield: number;
  allocatedYield: number;
  availableYield: number;
}

export async function getAllocatedAquiferBalance(walletAddress: string) {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${aquifers.balanceUSDC}), 0)` })
    .from(aquifers)
    .where(eq(aquifers.walletAddress, walletAddress));

  return roundUSDC(Number(rows[0]?.total ?? 0));
}

export async function getProtectedPrincipal(walletAddress: string) {
  const rows = await db
    .select({
      deposits: sql<number>`coalesce(sum(case when ${userTransactions.kind} in ('deposit', 'sweep') and ${userTransactions.direction} = 'in' and ${userTransactions.status} = 'completed' then ${userTransactions.amountUSDC} else 0 end), 0)`,
      withdrawals: sql<number>`coalesce(sum(case when ${userTransactions.kind} = 'withdrawal' and ${userTransactions.direction} = 'out' and ${userTransactions.status} = 'completed' then ${userTransactions.amountUSDC} else 0 end), 0)`,
    })
    .from(userTransactions)
    .where(eq(userTransactions.walletAddress, walletAddress));

  const principalDeposited = roundUSDC(Number(rows[0]?.deposits ?? 0));
  const principalWithdrawn = roundUSDC(Number(rows[0]?.withdrawals ?? 0));
  const protectedPrincipal = roundUSDC(Math.max(principalDeposited - principalWithdrawn, 0));

  return { principalDeposited, principalWithdrawn, protectedPrincipal };
}

export async function getWealthSnapshot(walletAddress: string, currentVaultBalance: number): Promise<WealthSnapshot> {
  const { principalDeposited, principalWithdrawn, protectedPrincipal: dbProtectedPrincipal } = await getProtectedPrincipal(walletAddress);
  const allocatedYield = await getAllocatedAquiferBalance(walletAddress);
  const normalizedVaultBalance = roundUSDC(currentVaultBalance);
  
  let earnedYield = roundUSDC(Math.max(normalizedVaultBalance - dbProtectedPrincipal, 0));
  let protectedPrincipal = dbProtectedPrincipal;

  try {
    const performance = await getUserPerformance(api, 'base', VAULTS.yoUSD.address as `0x${string}`, walletAddress as `0x${string}`);
    if (performance) {
      const unrealizedPnL = Number(performance.unrealized.formatted);
      earnedYield = roundUSDC(unrealizedPnL);
      protectedPrincipal = roundUSDC(Math.max(normalizedVaultBalance - unrealizedPnL, 0));
    }
  } catch (err: unknown) {
    console.error("Failed to fetch on-chain user performance, falling back to db calculations", err);
  }

  const availableYield = roundUSDC(Math.max(earnedYield - allocatedYield, 0));

  return {
    principalDeposited,
    principalWithdrawn,
    protectedPrincipal,
    currentVaultBalance: normalizedVaultBalance,
    earnedYield,
    allocatedYield,
    availableYield,
  };
}

export async function allocateYieldToAquifers(walletAddress: string, availableYield: number) {
  const configuredAquifers = await db
    .select()
    .from(aquifers)
    .where(eq(aquifers.walletAddress, walletAddress));

  const activeAquifers = configuredAquifers.filter((aquifer) => aquifer.status !== "paused" && aquifer.status !== "draft");

  if (activeAquifers.length === 0 || availableYield <= 0) {
    return [] as Array<{ id: string; name: string; amount: number }>;
  }

  const allocations = activeAquifers.map((aquifer, index) => {
    const rawAmount = availableYield * (aquifer.allocationPercent / 100);
    const roundedAmount = index === activeAquifers.length - 1
      ? availableYield - activeAquifers.slice(0, -1).reduce((acc, item) => acc + roundUSDC(availableYield * (item.allocationPercent / 100)), 0)
      : roundUSDC(rawAmount);

    return {
      id: aquifer.id,
      name: aquifer.name,
      amount: roundUSDC(Math.max(roundedAmount, 0)),
      currentBalance: roundUSDC(Number(aquifer.balanceUSDC ?? 0)),
    };
  }).filter((allocation) => allocation.amount > 0);

  for (const allocation of allocations) {
    await db
      .update(aquifers)
      .set({ balanceUSDC: roundUSDC(allocation.currentBalance + allocation.amount), updatedAt: new Date() })
      .where(and(eq(aquifers.walletAddress, walletAddress), eq(aquifers.id, allocation.id)));
  }

  return allocations.map(({ id, name, amount }) => ({ id, name, amount }));
}

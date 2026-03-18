"use server";

import { db } from "@/db";
import { aquifers, ngos, yieldRouters, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { recordAquiferEvent } from "@/actions/aquifers";
import { estimateSubscriptionPrincipal } from "@/lib/aquifers";

type AquiferInput = {
  id: string;
  name: string;
  type: "reserve" | "subscription" | "goal" | "shared" | "charity" | "tax";
  status: "draft" | "active" | "paused" | "completed" | "locked" | "unlocked";
  allocationPercent: number;
  targetAmountUSDC?: number | null;
  targetMonthlyOutflowUSDC?: number | null;
  targetDate?: string | null;
  unlockAt?: string | null;
  overflowMode: "compound" | "general_balance" | "donation";
  color?: string | null;
  notes?: string | null;
  requiredPrincipalSnapshotUSDC?: number | null;
  estimatedApyBps?: number | null;
};

type RouterInput = {
  id: string;
  type: "subscription" | "donation";
  name: string;
  amountUSDC: number;
  destinationAddress?: string;
  ngoId?: string | null;
};

async function getAuthAddress() {
  const session = await getSession();
  if (!session.address) {
    throw new Error("Unauthorized: Please sign in with your wallet first.");
  }
  return session.address;
}

async function ensureUserExists(address: string) {
  const user = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
  if (user.length === 0) {
    await db.insert(users).values({ walletAddress: address }).onConflictDoNothing({ target: users.walletAddress });
  }
}

function normalizePercent(value: number) {
  return Number(value.toFixed(2));
}

function normalizeUSDC(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return Number(value.toFixed(2));
}

function normalizeOptionalDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function normalizeApyBps(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return Math.round(value);
}

async function resolveDonationDestination(input: RouterInput) {
  if (input.type !== "donation") {
    return { destinationAddress: null as string | null, ngoId: null as string | null };
  }

  if (input.ngoId) {
    const ngo = await db.select().from(ngos).where(eq(ngos.id, input.ngoId)).limit(1);
    if (ngo.length === 0) {
      throw new Error("Selected NGO was not found.");
    }

    return {
      destinationAddress: ngo[0].walletAddress,
      ngoId: ngo[0].id,
    };
  }

  if (!input.destinationAddress) {
    throw new Error("Donations require a destination address");
  }

  return {
    destinationAddress: input.destinationAddress,
    ngoId: null,
  };
}

export async function getUserConfig() {
  const address = await getAuthAddress();

  const userAquifers = await db.select().from(aquifers).where(eq(aquifers.walletAddress, address));
  const userRouters = await db.select().from(yieldRouters).where(eq(yieldRouters.walletAddress, address));

  return { aquifers: userAquifers, yieldRouters: userRouters };
}

export async function updateAquifers(newAquifers: AquiferInput[]) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  if (newAquifers.length > 0) {
    const sum = newAquifers.reduce((acc, aquifer) => acc + aquifer.allocationPercent, 0);
    if (sum > 100.01) {
      throw new Error("Aquifer allocation cannot exceed 100%.");
    }
  }

  const existingAquifers = await db.select().from(aquifers).where(eq(aquifers.walletAddress, address));
  const existingBalances = new Map(existingAquifers.map((aquifer) => [aquifer.id, Number(aquifer.balanceUSDC ?? 0)]));
  const previousById = new Map(existingAquifers.map((aquifer) => [aquifer.id, aquifer]));
  const redistributedBalance = Number(
    existingAquifers.reduce((acc, aquifer) => acc + Number(aquifer.balanceUSDC ?? 0), 0).toFixed(2),
  );

  await db.delete(aquifers).where(eq(aquifers.walletAddress, address));

  if (newAquifers.length > 0) {
    const balanceSeed = redistributedBalance > 0
      ? newAquifers.map((aquifer, index) => {
          const proportional = Number((redistributedBalance * (aquifer.allocationPercent / 100)).toFixed(2));
          if (index === newAquifers.length - 1) {
            const priorTotal = newAquifers
              .slice(0, -1)
              .reduce((acc, item) => acc + Number((redistributedBalance * (item.allocationPercent / 100)).toFixed(2)), 0);
            return Number((redistributedBalance - priorTotal).toFixed(2));
          }
          return proportional;
        })
      : [];

    await db.insert(aquifers).values(
      newAquifers.map((aquifer, index) => ({
        id: aquifer.id,
        walletAddress: address,
        name: aquifer.name.trim(),
        type: aquifer.type,
        status: aquifer.status,
        allocationPercent: normalizePercent(aquifer.allocationPercent),
        balanceUSDC: existingBalances.get(aquifer.id) ?? balanceSeed[index] ?? 0,
        targetAmountUSDC: normalizeUSDC(aquifer.targetAmountUSDC),
        targetMonthlyOutflowUSDC: normalizeUSDC(aquifer.targetMonthlyOutflowUSDC),
        targetDate: normalizeOptionalDate(aquifer.targetDate),
        unlockAt: normalizeOptionalDate(aquifer.unlockAt),
        requiredPrincipalSnapshotUSDC:
          aquifer.type === "subscription"
            ? normalizeUSDC(
                aquifer.requiredPrincipalSnapshotUSDC ?? estimateSubscriptionPrincipal(
                  aquifer.targetMonthlyOutflowUSDC ?? 0,
                  (aquifer.estimatedApyBps ?? 0) / 100,
                ),
              )
            : null,
        estimatedApyBps: normalizeApyBps(aquifer.estimatedApyBps),
        overflowMode: aquifer.overflowMode,
        color: aquifer.color ?? null,
        notes: aquifer.notes?.trim() || null,
        createdAt: previousById.get(aquifer.id)?.createdAt ?? new Date(),
        updatedAt: new Date(),
      })),
    );

    for (const aquifer of newAquifers) {
      const previous = previousById.get(aquifer.id);
      if (!previous) {
        await recordAquiferEvent({
          aquiferId: aquifer.id,
          eventType: "created",
          title: `Created ${aquifer.name}`,
          details: `${aquifer.type} aquifer at ${aquifer.allocationPercent}% allocation.`,
        });
        continue;
      }

      if (previous.status !== aquifer.status) {
        await recordAquiferEvent({
          aquiferId: aquifer.id,
          eventType: "status_changed",
          title: `${aquifer.name} status updated`,
          details: `${previous.status} -> ${aquifer.status}`,
        });
      }

      if (previous.overflowMode !== aquifer.overflowMode) {
        await recordAquiferEvent({
          aquiferId: aquifer.id,
          eventType: "overflow_changed",
          title: `${aquifer.name} overflow updated`,
          details: `${previous.overflowMode} -> ${aquifer.overflowMode}`,
        });
      }

      if (
        previous.name !== aquifer.name ||
        previous.type !== aquifer.type ||
        previous.allocationPercent !== aquifer.allocationPercent ||
        Number(previous.targetAmountUSDC ?? 0) !== Number(aquifer.targetAmountUSDC ?? 0) ||
        Number(previous.targetMonthlyOutflowUSDC ?? 0) !== Number(aquifer.targetMonthlyOutflowUSDC ?? 0)
      ) {
        await recordAquiferEvent({
          aquiferId: aquifer.id,
          eventType: "updated",
          title: `${aquifer.name} updated`,
          details: `${aquifer.type} aquifer now receives ${aquifer.allocationPercent}% of new yield.`,
        });
      }
    }
  }

  for (const removed of existingAquifers) {
    if (!newAquifers.some((aquifer) => aquifer.id === removed.id)) {
      await recordAquiferEvent({
        aquiferId: removed.id,
        eventType: "deleted",
        title: `${removed.name} removed`,
        details: "Aquifer removed from the active configuration.",
      });
    }
  }

  return { success: true };
}

export async function addYieldRouter(router: RouterInput) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  const donationTarget = await resolveDonationDestination(router);

  await db.insert(yieldRouters).values({
    ...router,
    walletAddress: address,
    destinationAddress: donationTarget.destinationAddress,
    ngoId: donationTarget.ngoId,
    isActive: true,
  });

  return { success: true };
}

export async function updateYieldRouter(router: RouterInput) {
  const address = await getAuthAddress();

  const existing = await db.select().from(yieldRouters).where(eq(yieldRouters.id, router.id)).limit(1);
  if (existing.length === 0 || existing[0].walletAddress !== address) {
    throw new Error("Not found or unauthorized");
  }

  const donationTarget = await resolveDonationDestination(router);

  await db.update(yieldRouters).set({
    type: router.type,
    name: router.name,
    amountUSDC: router.amountUSDC,
    destinationAddress: donationTarget.destinationAddress,
    ngoId: donationTarget.ngoId,
  }).where(eq(yieldRouters.id, router.id));

  return { success: true };
}

export async function deleteYieldRouter(id: string) {
  const address = await getAuthAddress();

  const existing = await db.select().from(yieldRouters).where(eq(yieldRouters.id, id)).limit(1);
  if (existing.length === 0 || existing[0].walletAddress !== address) {
    throw new Error("Not found or unauthorized");
  }

  await db.delete(yieldRouters).where(eq(yieldRouters.id, id));
  return { success: true };
}

export async function toggleYieldRouter(id: string, isActive: boolean) {
  const address = await getAuthAddress();

  const existing = await db.select().from(yieldRouters).where(eq(yieldRouters.id, id)).limit(1);
  if (existing.length === 0 || existing[0].walletAddress !== address) {
    throw new Error("Not found or unauthorized");
  }

  await db.update(yieldRouters).set({ isActive }).where(eq(yieldRouters.id, id));
  return { success: true };
}

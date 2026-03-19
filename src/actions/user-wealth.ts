"use server";

import { db } from "@/db";
import { aquifers, userTransactions, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { allocateYieldToAquifers, getWealthSnapshot } from "@/lib/wealth";
import { eq } from "drizzle-orm";
import { recordAquiferEvent } from "@/actions/aquifers";
import { Mutex } from "async-mutex";

const allocationMutex = new Mutex();

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

function normalizeBalance(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Number(value.toFixed(2));
}

export async function getUserWealth(currentVaultBalance: number) {
  const address = await getAuthAddress();
  return getWealthSnapshot(address, normalizeBalance(currentVaultBalance));
}

export async function allocateAvailableYield(currentVaultBalance: number) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  // Use a mutex to prevent race conditions when multiple allocation requests
  // are fired concurrently (e.g. user double-clicking the button)
  return await allocationMutex.runExclusive(async () => {
    const snapshot = await getWealthSnapshot(address, normalizeBalance(currentVaultBalance));
    if (snapshot.availableYield <= 0) {
      return {
        success: true,
        allocatedTotal: 0,
        allocations: [],
        snapshot,
      };
    }

    const userAquifers = await db.select().from(aquifers).where(eq(aquifers.walletAddress, address));
    if (userAquifers.length === 0) {
      throw new Error("Create at least one aquifer before allocating yield.");
    }

    const allocations = await allocateYieldToAquifers(address, snapshot.availableYield);

    for (const allocation of allocations) {
      await db.insert(userTransactions).values({
        id: crypto.randomUUID(),
        walletAddress: address,
        kind: "allocation",
        title: `Yield allocated to ${allocation.name}`,
        details: "Available vault yield moved into an internal aquifer balance",
        amountUSDC: allocation.amount,
        direction: "in",
        status: "completed",
        source: "user",
        createdAt: new Date(),
      });

      await recordAquiferEvent({
        aquiferId: allocation.id,
        eventType: "allocation",
        title: `Yield allocated to ${allocation.name}`,
        details: "Available vault yield moved into this aquifer balance.",
        amountUSDC: allocation.amount,
      });
    }

    const updatedSnapshot = await getWealthSnapshot(address, normalizeBalance(currentVaultBalance));

    return {
      success: true,
      allocatedTotal: snapshot.availableYield,
      allocations,
      snapshot: updatedSnapshot,
    };
  });
}

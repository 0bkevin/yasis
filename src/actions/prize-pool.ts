"use server";

import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { prizePools, prizePoolEntries, prizeDraws } from "@/db/schema";
import { getSession } from "@/lib/session";

async function getAuthAddress() {
  const session = await getSession();
  if (!session.address) {
    throw new Error("Unauthorized");
  }
  return session.address;
}

export async function getCurrentPrizePool() {
  const activePool = await db.select().from(prizePools).where(eq(prizePools.status, "open")).limit(1);
  if (activePool.length > 0) return activePool[0];

  // Seed a new pool if none exists
  const nextDrawDate = new Date();
  nextDrawDate.setDate(nextDrawDate.getDate() + (7 - nextDrawDate.getDay())); // Next Sunday
  
  const id = crypto.randomUUID();
  await db.insert(prizePools).values({
    id,
    status: "open",
    currentYieldPotUSDC: 0,
    drawStartsAt: nextDrawDate,
  });

  return (await db.select().from(prizePools).where(eq(prizePools.id, id)).limit(1))[0];
}

export async function enterPrizePool(amountUSDC: number) {
  const address = await getAuthAddress();
  const pool = await getCurrentPrizePool();

  const existingEntry = await db.select().from(prizePoolEntries)
    .where(
      and(
        eq(prizePoolEntries.poolId, pool.id),
        eq(prizePoolEntries.walletAddress, address)
      )
    )
    .limit(1);

  if (existingEntry.length > 0) {
    throw new Error("Already entered into this week's pool");
  }

  await db.insert(prizePoolEntries).values({
    id: crypto.randomUUID(),
    poolId: pool.id,
    walletAddress: address,
    principalDepositedUSDC: amountUSDC,
    yieldContributedUSDC: 0, // In reality, yield accumulates over the week
  });

  return { success: true };
}

export async function getPrizeHistory(limit = 10) {
  await getAuthAddress(); // Just to enforce auth
  return db.select().from(prizeDraws).orderBy(desc(prizeDraws.executedAt)).limit(limit);
}

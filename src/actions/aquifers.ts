"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aquiferEvents, users } from "@/db/schema";
import { getSession } from "@/lib/session";

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

export async function recordAquiferEvent(input: {
  aquiferId?: string | null;
  eventType: "created" | "updated" | "deleted" | "allocation" | "status_changed" | "overflow_changed";
  title: string;
  details?: string;
  amountUSDC?: number;
}) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  await db.insert(aquiferEvents).values({
    id: crypto.randomUUID(),
    aquiferId: input.aquiferId ?? null,
    walletAddress: address,
    eventType: input.eventType,
    title: input.title,
    details: input.details?.trim() || null,
    amountUSDC: input.amountUSDC ?? null,
    createdAt: new Date(),
  });

  return { success: true };
}

export async function getRecentAquiferEvents(limit = 20) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const rows = await db
    .select()
    .from(aquiferEvents)
    .where(eq(aquiferEvents.walletAddress, address))
    .orderBy(desc(aquiferEvents.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  }));
}

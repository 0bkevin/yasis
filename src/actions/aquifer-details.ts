"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aquiferEvents, aquifers } from "@/db/schema";
import { getSession } from "@/lib/session";

async function getAuthAddress() {
  const session = await getSession();
  if (!session.address) {
    throw new Error("Unauthorized: Please sign in with your wallet first.");
  }
  return session.address;
}

export async function getAquiferDetails(id: string) {
  const address = await getAuthAddress();

  const rows = await db.select().from(aquifers).where(eq(aquifers.id, id)).limit(1);
  if (rows.length === 0 || rows[0].walletAddress !== address) {
    throw new Error("Aquifer not found or unauthorized.");
  }

  return rows[0];
}

export async function getAquiferEventHistory(aquiferId: string, limit = 30) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const rows = await db
    .select()
    .from(aquiferEvents)
    .where(eq(aquiferEvents.aquiferId, aquiferId))
    .orderBy(desc(aquiferEvents.createdAt))
    .limit(safeLimit);

  return rows
    .filter((row) => row.walletAddress === address)
    .map((row) => ({
      ...row,
      createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    }));
}

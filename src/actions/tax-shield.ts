"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { taxEvents, taxProfiles, taxReserves, users } from "@/db/schema";
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

export async function getTaxShieldConfig() {
  const address = await getAuthAddress();
  
  const profiles = await db.select().from(taxProfiles).where(eq(taxProfiles.walletAddress, address)).limit(1);
  const reserves = await db.select().from(taxReserves).where(eq(taxReserves.walletAddress, address)).limit(1);

  return {
    profile: profiles[0] ?? {
      walletAddress: address,
      routingPercent: 30,
      jurisdiction: "US",
      filingFrequency: "quarterly",
      isEnabled: false,
    },
    reserve: reserves[0] ?? {
      id: "none",
      walletAddress: address,
      balanceUSDC: 0,
      bonusYieldEarnedUSDC: 0,
    },
  };
}

export async function updateTaxShieldProfile(input: {
  routingPercent: number;
  jurisdiction: string;
  filingFrequency: "quarterly" | "annual";
  isEnabled: boolean;
}) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  const existingProfile = await db.select().from(taxProfiles).where(eq(taxProfiles.walletAddress, address)).limit(1);
  
  const payload = {
    walletAddress: address,
    routingPercent: Number(input.routingPercent.toFixed(2)),
    jurisdiction: input.jurisdiction,
    filingFrequency: input.filingFrequency,
    isEnabled: input.isEnabled,
    updatedAt: new Date(),
  };

  if (existingProfile.length > 0) {
    await db.update(taxProfiles).set(payload).where(eq(taxProfiles.walletAddress, address));
  } else {
    await db.insert(taxProfiles).values(payload);
  }

  const existingReserve = await db.select().from(taxReserves).where(eq(taxReserves.walletAddress, address)).limit(1);
  if (existingReserve.length === 0) {
    await db.insert(taxReserves).values({
      id: crypto.randomUUID(),
      walletAddress: address,
      balanceUSDC: 0,
      bonusYieldEarnedUSDC: 0,
    });
  }

  return { success: true };
}

export async function getRecentTaxEvents(limit = 20) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const rows = await db
    .select()
    .from(taxEvents)
    .where(eq(taxEvents.walletAddress, address))
    .orderBy(desc(taxEvents.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  }));
}

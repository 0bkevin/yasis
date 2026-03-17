"use server";

import { db } from "@/db";
import { pockets, yieldRouters, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

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
    await db.insert(users).values({ walletAddress: address });
  }
}

export async function getUserConfig() {
  const address = await getAuthAddress();
  
  const userPockets = await db.select().from(pockets).where(eq(pockets.walletAddress, address));
  const userRouters = await db.select().from(yieldRouters).where(eq(yieldRouters.walletAddress, address));
  
  return { pockets: userPockets, yieldRouters: userRouters };
}

export async function updatePockets(newPockets: { id: string, name: string, percentage: number, color?: string }[]) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  // Validation: sum must be 100
  const sum = newPockets.reduce((acc, p) => acc + p.percentage, 0);
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error("Pockets percentage must sum to 100%");
  }

  // Delete existing and replace
  await db.delete(pockets).where(eq(pockets.walletAddress, address));
  
  if (newPockets.length > 0) {
    await db.insert(pockets).values(
      newPockets.map(p => ({
        ...p,
        walletAddress: address,
      }))
    );
  }
  
  return { success: true };
}

export async function addYieldRouter(router: { id: string, type: "subscription" | "donation", name: string, amountUSDC: number, destinationAddress?: string }) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  if (router.type === 'donation' && !router.destinationAddress) {
    throw new Error("Donations require a destination address");
  }

  await db.insert(yieldRouters).values({
    ...router,
    walletAddress: address,
    isActive: true
  });

  return { success: true };
}

export async function deleteYieldRouter(id: string) {
  const address = await getAuthAddress();
  
  // Verify ownership before deleting
  const existing = await db.select().from(yieldRouters).where(eq(yieldRouters.id, id)).limit(1);
  if (existing.length === 0 || existing[0].walletAddress !== address) {
    throw new Error("Not found or unauthorized");
  }

  await db.delete(yieldRouters).where(eq(yieldRouters.id, id));
  return { success: true };
}

export async function toggleYieldRouter(id: string, isActive: boolean) {
  const address = await getAuthAddress();
  
  // Verify ownership before updating
  const existing = await db.select().from(yieldRouters).where(eq(yieldRouters.id, id)).limit(1);
  if (existing.length === 0 || existing[0].walletAddress !== address) {
    throw new Error("Not found or unauthorized");
  }

  await db.update(yieldRouters).set({ isActive }).where(eq(yieldRouters.id, id));
  return { success: true };
}

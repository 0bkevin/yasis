"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { linkedAccounts, syncRuns, spareBankTransactions, users } from "@/db/schema";
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

export async function getLinkedAccounts() {
  const address = await getAuthAddress();
  const rows = await db.select().from(linkedAccounts).where(eq(linkedAccounts.walletAddress, address));
  return rows.map(r => ({
    ...r,
    lastSyncAt: r.lastSyncAt ? r.lastSyncAt.toISOString() : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
  }));
}

export async function connectMockAccount(institutionName: string) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  await db.insert(linkedAccounts).values({
    id: crypto.randomUUID(),
    walletAddress: address,
    institutionName,
    accountMask: `...${Math.floor(1000 + Math.random() * 9000)}`,
    status: "active",
    createdAt: new Date(),
  });

  return { success: true };
}

export async function triggerMockSync(accountId: string) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  const account = await db.select().from(linkedAccounts).where(eq(linkedAccounts.id, accountId)).limit(1);
  if (account.length === 0 || account[0].walletAddress !== address) {
    throw new Error("Account not found");
  }

  const syncRunId = crypto.randomUUID();
  const mockMerchants = ["Whole Foods", "Shell Gas", "Spotify", "Netflix", "Uber", "Local Coffee Shop"];
  const numTx = Math.floor(Math.random() * 5) + 2; // 2-6 txs
  
  let totalRoundUp = 0;

  for (let i = 0; i < numTx; i++) {
    const amount = Number((Math.random() * 50 + 5).toFixed(2));
    const roundUpAmount = Number((Math.ceil(amount) - amount).toFixed(2));
    totalRoundUp += roundUpAmount;

    await db.insert(spareBankTransactions).values({
      id: crypto.randomUUID(),
      walletAddress: address,
      merchant: mockMerchants[Math.floor(Math.random() * mockMerchants.length)],
      amount,
      roundUpAmount,
      status: "pending",
      isDemo: false,
      accountId,
      syncRunId,
      occurredAt: new Date(Date.now() - Math.random() * 86400000 * 2), // past 48h
      createdAt: new Date(),
    });
  }

  await db.insert(syncRuns).values({
    id: syncRunId,
    walletAddress: address,
    status: "success",
    transactionsFound: numTx,
    roundUpGeneratedUSDC: Number(totalRoundUp.toFixed(2)),
    createdAt: new Date(),
  });

  await db.update(linkedAccounts).set({ lastSyncAt: new Date() }).where(eq(linkedAccounts.id, accountId));

  return { success: true, transactionsFound: numTx, roundUpGenerated: Number(totalRoundUp.toFixed(2)) };
}

export async function getRecentSyncRuns(limit = 10) {
  const address = await getAuthAddress();
  const rows = await db.select().from(syncRuns).where(eq(syncRuns.walletAddress, address)).orderBy(desc(syncRuns.createdAt)).limit(limit);
  return rows.map(r => ({
    ...r,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
  }));
}

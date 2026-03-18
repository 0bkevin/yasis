"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { spareBankTransactions, userTransactions, users } from "@/db/schema";
import { getSession } from "@/lib/session";

type TransactionKind = "deposit" | "sweep" | "route" | "withdrawal" | "manual" | "allocation";
type TransactionDirection = "in" | "out";
type TransactionStatus = "pending" | "completed" | "failed";
type TransactionSource = "user" | "demo";

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

function normalizeUSDC(value: number) {
  return Number(value.toFixed(2));
}

function toIso(value: Date | null) {
  return value ? value.toISOString() : null;
}

function calculateRoundUp(amount: number) {
  const roundedAmount = Math.round(amount * 100) / 100;
  const diff = Math.ceil(roundedAmount) - roundedAmount;
  return Number(diff.toFixed(2));
}

export async function getUserTransactions(limit = 50) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  const rows = await db
    .select()
    .from(userTransactions)
    .where(eq(userTransactions.walletAddress, address))
    .orderBy(desc(userTransactions.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    createdAt: toIso(row.createdAt),
  }));
}

export async function createUserTransaction(input: {
  kind: TransactionKind;
  title: string;
  details?: string;
  counterparty?: string;
  amountUSDC: number;
  direction: TransactionDirection;
  status?: TransactionStatus;
  txHash?: string;
  source?: TransactionSource;
}) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  if (!input.title.trim()) {
    throw new Error("Transaction title is required");
  }

  if (!Number.isFinite(input.amountUSDC) || input.amountUSDC <= 0) {
    throw new Error("Transaction amount must be greater than 0");
  }

  await db.insert(userTransactions).values({
    id: crypto.randomUUID(),
    walletAddress: address,
    kind: input.kind,
    title: input.title.trim(),
    details: input.details?.trim() || null,
    counterparty: input.counterparty?.trim() || null,
    amountUSDC: normalizeUSDC(input.amountUSDC),
    direction: input.direction,
    status: input.status ?? "completed",
    txHash: input.txHash?.trim() || null,
    source: input.source ?? "user",
    createdAt: new Date(),
  });

  return { success: true };
}

export async function getSpareBankTransactions() {
  const address = await getAuthAddress();

  const rows = await db
    .select()
    .from(spareBankTransactions)
    .where(eq(spareBankTransactions.walletAddress, address))
    .orderBy(desc(spareBankTransactions.occurredAt));

  return rows.map((row) => ({
    ...row,
    occurredAt: toIso(row.occurredAt),
    sweptAt: toIso(row.sweptAt),
    createdAt: toIso(row.createdAt),
  }));
}

export async function addSpareBankTransaction(input: {
  merchant: string;
  amount: number;
  occurredAt?: string;
}) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  const merchant = input.merchant.trim();
  if (!merchant) {
    throw new Error("Merchant is required");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const amount = normalizeUSDC(input.amount);
  const roundUpAmount = calculateRoundUp(amount);
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();

  await db.insert(spareBankTransactions).values({
    id: crypto.randomUUID(),
    walletAddress: address,
    merchant,
    amount,
    roundUpAmount,
    status: "pending",
    isDemo: false,
    occurredAt,
    createdAt: new Date(),
  });

  return { success: true };
}

export async function populateDemoSpareTransactions() {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  await db
    .delete(spareBankTransactions)
    .where(and(eq(spareBankTransactions.walletAddress, address), eq(spareBankTransactions.isDemo, true)));

  const demoRows = [
    { merchant: "Starbucks", amount: 4.2 },
    { merchant: "Uber", amount: 12.4 },
    { merchant: "Trader Joe's", amount: 6.5 },
    { merchant: "Spotify", amount: 11.99 },
    { merchant: "Whole Foods", amount: 42.15 },
  ];

  const now = Date.now();

  await db.insert(spareBankTransactions).values(
    demoRows.map((row, index) => ({
      id: crypto.randomUUID(),
      walletAddress: address,
      merchant: row.merchant,
      amount: normalizeUSDC(row.amount),
      roundUpAmount: calculateRoundUp(row.amount),
      status: "pending" as const,
      isDemo: true,
      occurredAt: new Date(now - index * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    })),
  );

  return { success: true, count: demoRows.length };
}

export async function markSpareTransactionsSwept(transactionIds: string[]) {
  const address = await getAuthAddress();

  if (transactionIds.length === 0) {
    return { success: true, sweptCount: 0 };
  }

  const pendingRows = await db
    .select({ id: spareBankTransactions.id, roundUpAmount: spareBankTransactions.roundUpAmount })
    .from(spareBankTransactions)
    .where(
      and(
        eq(spareBankTransactions.walletAddress, address),
        inArray(spareBankTransactions.id, transactionIds),
        eq(spareBankTransactions.status, "pending"),
      ),
    );

  if (pendingRows.length === 0) {
    return { success: true, sweptCount: 0 };
  }

  await db
    .update(spareBankTransactions)
    .set({ status: "swept", sweptAt: new Date() })
    .where(inArray(spareBankTransactions.id, pendingRows.map((row) => row.id)));

  const totalAmount = pendingRows.reduce((acc, row) => acc + row.roundUpAmount, 0);
  await db.insert(userTransactions).values({
    id: crypto.randomUUID(),
    walletAddress: address,
    kind: "sweep",
    title: "Spare Change Sweep",
    details: `Swept ${pendingRows.length} round-ups into the vault`,
    amountUSDC: Number(totalAmount.toFixed(2)),
    direction: "in",
    status: "completed",
    source: "user",
    createdAt: new Date(),
  });

  return { success: true, sweptCount: pendingRows.length };
}

"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { donationReceipts, ngos, userTransactions, users, yieldRouterExecutions, yieldRouters } from "@/db/schema";
import { getSession } from "@/lib/session";

type ExecutionStatus = "completed" | "failed";

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

export async function getDonationRouterExecutionPlan(availableYield: number) {
  const address = await getAuthAddress();

  const routers = await db
    .select()
    .from(yieldRouters)
    .where(eq(yieldRouters.walletAddress, address));

  const activeDonationRouters = routers.filter((router) => router.isActive && router.type === "donation");

  const executableRouters = activeDonationRouters
    .filter((router) => Boolean(router.destinationAddress))
    .map((router) => ({
      id: router.id,
      name: router.name,
      amountUSDC: normalizeUSDC(router.amountUSDC),
      destinationAddress: router.destinationAddress!,
    }));

  const skippedRouters = activeDonationRouters
    .filter((router) => !router.destinationAddress)
    .map((router) => ({
      id: router.id,
      name: router.name,
      reason: "Missing destination address",
    }));

  const totalAmountUSDC = normalizeUSDC(
    executableRouters.reduce((acc, router) => acc + router.amountUSDC, 0),
  );

  return {
    executableRouters,
    skippedRouters,
    totalAmountUSDC,
    availableYield: normalizeUSDC(availableYield),
    hasSufficientYield: totalAmountUSDC <= normalizeUSDC(availableYield),
  };
}

export async function recordDonationRouterExecution(input: {
  routerId: string;
  amountUSDC: number;
  status: ExecutionStatus;
  txHash?: string;
  errorMessage?: string;
}) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  const router = await db
    .select()
    .from(yieldRouters)
    .where(eq(yieldRouters.id, input.routerId))
    .limit(1);

  if (router.length === 0 || router[0].walletAddress !== address) {
    throw new Error("Yield router not found or unauthorized.");
  }

  if (router[0].type !== "donation") {
    throw new Error("Only donation routers can be recorded as executable transfers.");
  }

  const normalizedAmount = normalizeUSDC(input.amountUSDC);

  const executionId = crypto.randomUUID();

  await db.insert(yieldRouterExecutions).values({
    id: executionId,
    routerId: input.routerId,
    walletAddress: address,
    amountUSDC: normalizedAmount,
    status: input.status,
    txHash: input.txHash?.trim() || null,
    errorMessage: input.errorMessage?.trim() || null,
    createdAt: new Date(),
  });

  await db.insert(userTransactions).values({
    id: crypto.randomUUID(),
    walletAddress: address,
    kind: "route",
    title: input.status === "completed" ? "Donation Route" : "Donation Route Failed",
    details:
      input.status === "completed"
        ? "Yield routed to external donation destination"
        : input.errorMessage?.trim() || "Donation route attempt failed",
    counterparty: router[0].name,
    amountUSDC: normalizedAmount,
    direction: "out",
    status: input.status,
    txHash: input.txHash?.trim() || null,
    source: "user",
    createdAt: new Date(),
  });

  if (input.status === "completed" && router[0].ngoId) {
    const ngo = await db.select().from(ngos).where(eq(ngos.id, router[0].ngoId)).limit(1);
    if (ngo.length > 0) {
      const impactValue = normalizeUSDC(normalizedAmount * ngo[0].impactUnitPerUSDC);
      await db.insert(donationReceipts).values({
        id: crypto.randomUUID(),
        routerId: router[0].id,
        executionId,
        ngoId: ngo[0].id,
        walletAddress: address,
        ngoNameSnapshot: ngo[0].name,
        impactUnitLabelSnapshot: ngo[0].impactUnitLabel,
        impactUnitPerUSDCSnapshot: ngo[0].impactUnitPerUSDC,
        amountUSDC: normalizedAmount,
        impactValue,
        txHash: input.txHash?.trim() || null,
        createdAt: new Date(),
      });
    }
  }

  return { success: true };
}

export async function getRecentYieldRouterExecutions(limit = 20) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const rows = await db
    .select()
    .from(yieldRouterExecutions)
    .where(eq(yieldRouterExecutions.walletAddress, address))
    .orderBy(desc(yieldRouterExecutions.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  }));
}

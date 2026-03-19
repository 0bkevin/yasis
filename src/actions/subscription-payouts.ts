"use server";

import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { aquiferEvents, aquifers, subscriptionPayoutExecutions, subscriptionPayoutSchedules, userTransactions, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { recordAquiferEvent } from "@/actions/aquifers";
import { Mutex } from "async-mutex";

const executePayoutsMutex = new Mutex();

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

function nextPayoutDate(billingDay: number) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(28, billingDay)));
  if (date <= now) {
    return new Date(now.getFullYear(), now.getMonth() + 1, Math.max(1, Math.min(28, billingDay)));
  }
  return date;
}

export async function getSubscriptionPayoutSchedule(aquiferId: string) {
  const address = await getAuthAddress();
  const rows = await db.select().from(subscriptionPayoutSchedules).where(eq(subscriptionPayoutSchedules.aquiferId, aquiferId)).limit(1);
  if (rows.length === 0 || rows[0].walletAddress !== address) {
    return null;
  }

  return {
    ...rows[0],
    nextPayoutAt: rows[0].nextPayoutAt ? rows[0].nextPayoutAt.toISOString() : null,
    createdAt: rows[0].createdAt ? rows[0].createdAt.toISOString() : null,
    updatedAt: rows[0].updatedAt ? rows[0].updatedAt.toISOString() : null,
  };
}

export async function upsertSubscriptionPayoutSchedule(input: {
  aquiferId: string;
  merchantName: string;
  monthlyAmountUSDC: number;
  billingDay: number;
  externalReference?: string;
  status: "draft" | "active" | "paused";
}) {
  const address = await getAuthAddress();
  await ensureUserExists(address);

  const aquifer = await db.select().from(aquifers).where(eq(aquifers.id, input.aquiferId)).limit(1);
  if (aquifer.length === 0 || aquifer[0].walletAddress !== address) {
    throw new Error("Aquifer not found or unauthorized.");
  }

  const existing = await db.select().from(subscriptionPayoutSchedules).where(eq(subscriptionPayoutSchedules.aquiferId, input.aquiferId)).limit(1);
  const payload = {
    aquiferId: input.aquiferId,
    walletAddress: address,
    merchantName: input.merchantName.trim(),
    monthlyAmountUSDC: Number(input.monthlyAmountUSDC.toFixed(2)),
    billingDay: input.billingDay,
    nextPayoutAt: nextPayoutDate(input.billingDay),
    externalReference: input.externalReference?.trim() || null,
    status: input.status,
    updatedAt: new Date(),
  };

  if (existing.length > 0) {
    await db.update(subscriptionPayoutSchedules).set(payload).where(eq(subscriptionPayoutSchedules.id, existing[0].id));
  } else {
    await db.insert(subscriptionPayoutSchedules).values({
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date(),
    });
  }

  await recordAquiferEvent({
    aquiferId: input.aquiferId,
    eventType: "updated",
    title: `${aquifer[0].name} payout schedule updated`,
    details: `${input.merchantName.trim()} billed on day ${input.billingDay} for $${input.monthlyAmountUSDC.toFixed(2)} / month.`,
    amountUSDC: input.monthlyAmountUSDC,
  });

  return { success: true };
}

export async function getUpcomingSubscriptionPayouts(limit = 20) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const rows = await db
    .select()
    .from(subscriptionPayoutSchedules)
    .where(eq(subscriptionPayoutSchedules.walletAddress, address))
    .orderBy(asc(subscriptionPayoutSchedules.nextPayoutAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    nextPayoutAt: row.nextPayoutAt ? row.nextPayoutAt.toISOString() : null,
  }));
}

export async function getSubscriptionPayoutExecutions(aquiferId?: string, limit = 20) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const rows = aquiferId
    ? await db
        .select()
        .from(subscriptionPayoutExecutions)
        .where(and(
          eq(subscriptionPayoutExecutions.aquiferId, aquiferId),
          eq(subscriptionPayoutExecutions.walletAddress, address),
        ))
        .limit(safeLimit)
    : await db
        .select()
        .from(subscriptionPayoutExecutions)
        .where(eq(subscriptionPayoutExecutions.walletAddress, address))
        .limit(safeLimit);

  return rows.map((row) => ({
      ...row,
      scheduledFor: row.scheduledFor ? row.scheduledFor.toISOString() : null,
      executedAt: row.executedAt ? row.executedAt.toISOString() : null,
    }));
}

function computeNextPayoutAt(from: Date, billingDay: number) {
  const next = new Date(from.getFullYear(), from.getMonth() + 1, Math.max(1, Math.min(28, billingDay)));
  return next;
}

export async function executeDueSubscriptionPayouts(aquiferId?: string) {
  const address = await getAuthAddress();
  
  return await executePayoutsMutex.runExclusive(async () => {
    const now = new Date();

    const allDueSchedules = await db
      .select()
      .from(subscriptionPayoutSchedules)
      .where(
        and(
          eq(subscriptionPayoutSchedules.walletAddress, address),
          eq(subscriptionPayoutSchedules.status, "active"),
          lte(subscriptionPayoutSchedules.nextPayoutAt, now),
        ),
      );

    const dueSchedules = aquiferId
      ? allDueSchedules.filter((schedule) => schedule.aquiferId === aquiferId)
      : allDueSchedules;

    const results: Array<{ scheduleId: string; merchantName: string; amountUSDC: number; status: "completed" | "skipped" }> = [];

    for (const schedule of dueSchedules) {
      const aquifer = await db.select().from(aquifers).where(eq(aquifers.id, schedule.aquiferId)).limit(1);
      if (aquifer.length === 0) {
        await db.insert(subscriptionPayoutExecutions).values({
          id: crypto.randomUUID(),
          scheduleId: schedule.id,
          aquiferId: schedule.aquiferId,
          walletAddress: address,
          merchantName: schedule.merchantName,
          amountUSDC: schedule.monthlyAmountUSDC,
          status: "skipped",
          details: "Associated aquifer not found.",
          scheduledFor: schedule.nextPayoutAt,
          executedAt: new Date(),
        });
        results.push({ scheduleId: schedule.id, merchantName: schedule.merchantName, amountUSDC: schedule.monthlyAmountUSDC, status: "skipped" });
        continue;
      }

      const currentBalance = Number(aquifer[0].balanceUSDC ?? 0);
      
      // Deduct the payout from the aquifer's balance
      await db.update(aquifers).set({
        balanceUSDC: Math.max(currentBalance - schedule.monthlyAmountUSDC, 0),
        updatedAt: new Date()
      }).where(eq(aquifers.id, schedule.aquiferId));

      await db.insert(userTransactions).values({
        id: crypto.randomUUID(),
        walletAddress: address,
        kind: "route",
        title: "Scheduled Subscription Payout",
        details: `Planned payout recorded for ${schedule.merchantName}`,
        counterparty: schedule.merchantName,
        amountUSDC: schedule.monthlyAmountUSDC,
        direction: "out",
        status: "completed",
        source: "user",
        createdAt: new Date(),
      });

      await db.insert(aquiferEvents).values({
        id: crypto.randomUUID(),
        aquiferId: schedule.aquiferId,
        walletAddress: address,
        eventType: "updated",
        title: `${schedule.merchantName} payout recorded`,
        details: `Scheduled subscription payout for $${schedule.monthlyAmountUSDC.toFixed(2)} was marked due and recorded.`,
        amountUSDC: schedule.monthlyAmountUSDC,
        createdAt: new Date(),
      });

      await db.insert(subscriptionPayoutExecutions).values({
        id: crypto.randomUUID(),
        scheduleId: schedule.id,
        aquiferId: schedule.aquiferId,
        walletAddress: address,
        merchantName: schedule.merchantName,
        amountUSDC: schedule.monthlyAmountUSDC,
        status: "completed",
        details: `Scheduled payout recorded for ${schedule.merchantName}.`,
        scheduledFor: schedule.nextPayoutAt,
        executedAt: new Date(),
      });

      await db.update(subscriptionPayoutSchedules).set({
        nextPayoutAt: computeNextPayoutAt(now, schedule.billingDay),
        updatedAt: new Date(),
      }).where(eq(subscriptionPayoutSchedules.id, schedule.id));

      results.push({ scheduleId: schedule.id, merchantName: schedule.merchantName, amountUSDC: schedule.monthlyAmountUSDC, status: "completed" });
    }

    return {
      success: true,
      processed: results.length,
      results,
    };
  });
}

"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ngos } from "@/db/schema";
import { getSession } from "@/lib/session";

async function requireSession() {
  const session = await getSession();
  if (!session.address) {
    throw new Error("Unauthorized: Please sign in with your wallet first.");
  }
}

export async function getActiveNgos() {
  return db.select().from(ngos).where(eq(ngos.status, "active")).orderBy(asc(ngos.name));
}

export async function getNgoById(id: string) {
  const rows = await db.select().from(ngos).where(eq(ngos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllNgos() {
  await requireSession();
  return db.select().from(ngos).orderBy(asc(ngos.name));
}

export async function upsertNgo(input: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  walletAddress: string;
  category: string;
  impactUnitLabel: string;
  impactUnitPerUSDC: number;
  status: "active" | "inactive";
  logoUrl?: string | null;
}) {
  await requireSession();

  const payload = {
    id: input.id ?? crypto.randomUUID(),
    slug: input.slug.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    walletAddress: input.walletAddress.trim(),
    category: input.category.trim(),
    impactUnitLabel: input.impactUnitLabel.trim(),
    impactUnitPerUSDC: Number(input.impactUnitPerUSDC.toFixed(4)),
    status: input.status,
    logoUrl: input.logoUrl?.trim() || null,
  };

  const existing = input.id ? await db.select().from(ngos).where(eq(ngos.id, input.id)).limit(1) : [];
  if (existing.length > 0) {
    await db.update(ngos).set(payload).where(eq(ngos.id, input.id!));
    return { success: true, id: input.id };
  }

  await db.insert(ngos).values(payload);
  return { success: true, id: payload.id };
}

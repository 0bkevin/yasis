"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sharedAquiferParticipants, sharedAquiferInvites, users } from "@/db/schema";
import { getSession } from "@/lib/session";

async function getAuthAddress() {
  const session = await getSession();
  if (!session.address) {
    throw new Error("Unauthorized");
  }
  return session.address;
}

export async function getSharedAquiferParticipants(aquiferId: string) {
  return db.select().from(sharedAquiferParticipants).where(eq(sharedAquiferParticipants.aquiferId, aquiferId));
}

export async function createSharedAquiferInvite(aquiferId: string, inviteeAddress?: string) {
  const address = await getAuthAddress();
  
  // Verify owner
  const participants = await db.select().from(sharedAquiferParticipants)
    .where(eq(sharedAquiferParticipants.aquiferId, aquiferId));
    
  const owner = participants.find(p => p.walletAddress === address && p.role === "owner");
  if (!owner) throw new Error("Not authorized");

  const id = crypto.randomUUID();
  await db.insert(sharedAquiferInvites).values({
    id,
    aquiferId,
    inviterAddress: address,
    inviteeAddress: inviteeAddress || null,
    status: "pending",
  });

  return { inviteId: id };
}

export async function acceptSharedAquiferInvite(inviteId: string) {
  const address = await getAuthAddress();
  
  // Verify user exists
  const user = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
  if (user.length === 0) {
    await db.insert(users).values({ walletAddress: address }).onConflictDoNothing({ target: users.walletAddress });
  }

  const invite = await db.select().from(sharedAquiferInvites).where(eq(sharedAquiferInvites.id, inviteId)).limit(1);
  if (invite.length === 0 || invite[0].status !== "pending") throw new Error("Invalid or expired invite");

  if (invite[0].inviteeAddress && invite[0].inviteeAddress !== address) {
    throw new Error("Invite is for another address");
  }

  await db.insert(sharedAquiferParticipants).values({
    id: crypto.randomUUID(),
    aquiferId: invite[0].aquiferId,
    walletAddress: address,
    role: "contributor",
    contributionUSDC: 0,
  });

  await db.update(sharedAquiferInvites).set({ status: "accepted" }).where(eq(sharedAquiferInvites.id, inviteId));

  return { success: true, aquiferId: invite[0].aquiferId };
}

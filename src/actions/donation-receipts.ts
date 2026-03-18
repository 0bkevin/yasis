"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { donationReceipts } from "@/db/schema";
import { getSession } from "@/lib/session";

async function getAuthAddress() {
  const session = await getSession();
  if (!session.address) {
    throw new Error("Unauthorized: Please sign in with your wallet first.");
  }
  return session.address;
}

export async function getDonationReceipts(limit = 50) {
  const address = await getAuthAddress();
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  const rows = await db
    .select()
    .from(donationReceipts)
    .where(eq(donationReceipts.walletAddress, address))
    .orderBy(desc(donationReceipts.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  }));
}

export async function exportDonationReceiptsReport() {
  const receipts = await getDonationReceipts(1000);
  const totalAmount = receipts.reduce((acc, receipt) => acc + receipt.amountUSDC, 0);
  const totalImpact = receipts.reduce((acc, receipt) => acc + receipt.impactValue, 0);

  const lines = [
    "Oasis Donation Report",
    `Generated: ${new Date().toISOString()}`,
    `Total donated: $${totalAmount.toFixed(2)}`,
    `Total impact units: ${totalImpact.toFixed(2)}`,
    "",
    "Receipts:",
    ...receipts.map((receipt) => {
      const date = receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : "-";
      return `${date} | ${receipt.ngoNameSnapshot} | $${receipt.amountUSDC.toFixed(2)} | ${receipt.impactValue.toFixed(2)} ${receipt.impactUnitLabelSnapshot}`;
    }),
  ];

  return {
    fileName: `oasis-donations-${new Date().toISOString().slice(0, 10)}.txt`,
    content: lines.join("\n"),
  };
}

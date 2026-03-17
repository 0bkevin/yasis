import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  walletAddress: text("wallet_address").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const pockets = sqliteTable("pockets", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  name: text("name").notNull(),
  percentage: real("percentage").notNull(),
  color: text("color"),
});

export const yieldRouters = sqliteTable("yield_routers", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  type: text("type", { enum: ["subscription", "donation"] }).notNull(),
  name: text("name").notNull(),
  amountUSDC: real("amount_usdc").notNull(),
  destinationAddress: text("destination_address"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

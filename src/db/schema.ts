import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  walletAddress: text("wallet_address").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const aquifers = sqliteTable("aquifers", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  name: text("name").notNull(),
  type: text("type", { enum: ["reserve", "subscription", "goal", "shared", "charity", "tax"] }).notNull().default("reserve"),
  status: text("status", { enum: ["draft", "active", "paused", "completed", "locked", "unlocked"] }).notNull().default("active"),
  allocationPercent: real("allocation_percent").notNull(),
  balanceUSDC: real("balance_usdc").notNull().default(0),
  requiredPrincipalSnapshotUSDC: real("required_principal_snapshot_usdc"),
  estimatedApyBps: integer("estimated_apy_bps"),
  targetAmountUSDC: real("target_amount_usdc"),
  targetMonthlyOutflowUSDC: real("target_monthly_outflow_usdc"),
  targetDate: integer("target_date", { mode: "timestamp" }),
  unlockAt: integer("unlock_at", { mode: "timestamp" }),
  overflowMode: text("overflow_mode", { enum: ["compound", "general_balance", "donation"] }).notNull().default("general_balance"),
  color: text("color"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const aquiferEvents = sqliteTable("aquifer_events", {
  id: text("id").primaryKey(),
  aquiferId: text("aquifer_id").references(() => aquifers.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  eventType: text("event_type", { enum: ["created", "updated", "deleted", "allocation", "status_changed", "overflow_changed"] }).notNull(),
  title: text("title").notNull(),
  details: text("details"),
  amountUSDC: real("amount_usdc"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const subscriptionPayoutSchedules = sqliteTable("subscription_payout_schedules", {
  id: text("id").primaryKey(),
  aquiferId: text("aquifer_id").notNull().references(() => aquifers.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  merchantName: text("merchant_name").notNull(),
  monthlyAmountUSDC: real("monthly_amount_usdc").notNull(),
  billingDay: integer("billing_day").notNull(),
  nextPayoutAt: integer("next_payout_at", { mode: "timestamp" }),
  externalReference: text("external_reference"),
  status: text("status", { enum: ["draft", "active", "paused"] }).notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const subscriptionPayoutExecutions = sqliteTable("subscription_payout_executions", {
  id: text("id").primaryKey(),
  scheduleId: text("schedule_id").notNull().references(() => subscriptionPayoutSchedules.id),
  aquiferId: text("aquifer_id").notNull().references(() => aquifers.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  merchantName: text("merchant_name").notNull(),
  amountUSDC: real("amount_usdc").notNull(),
  status: text("status", { enum: ["completed", "skipped", "failed"] }).notNull(),
  details: text("details"),
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }),
  executedAt: integer("executed_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const yieldRouters = sqliteTable("yield_routers", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  type: text("type", { enum: ["subscription", "donation"] }).notNull(),
  name: text("name").notNull(),
  amountUSDC: real("amount_usdc").notNull(),
  ngoId: text("ngo_id").references(() => ngos.id),
  destinationAddress: text("destination_address"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const ngos = sqliteTable("ngos", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  walletAddress: text("wallet_address").notNull(),
  category: text("category").notNull(),
  impactUnitLabel: text("impact_unit_label").notNull(),
  impactUnitPerUSDC: real("impact_unit_per_usdc").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  logoUrl: text("logo_url"),
});

export const donationReceipts = sqliteTable("donation_receipts", {
  id: text("id").primaryKey(),
  routerId: text("router_id").references(() => yieldRouters.id),
  executionId: text("execution_id").references(() => yieldRouterExecutions.id),
  ngoId: text("ngo_id").references(() => ngos.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  ngoNameSnapshot: text("ngo_name_snapshot").notNull(),
  impactUnitLabelSnapshot: text("impact_unit_label_snapshot").notNull(),
  impactUnitPerUSDCSnapshot: real("impact_unit_per_usdc_snapshot").notNull(),
  amountUSDC: real("amount_usdc").notNull(),
  impactValue: real("impact_value").notNull(),
  txHash: text("tx_hash"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const yieldRouterExecutions = sqliteTable("yield_router_executions", {
  id: text("id").primaryKey(),
  routerId: text("router_id").notNull().references(() => yieldRouters.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  amountUSDC: real("amount_usdc").notNull(),
  status: text("status", { enum: ["completed", "failed"] }).notNull(),
  txHash: text("tx_hash"),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const userTransactions = sqliteTable("user_transactions", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  kind: text("kind", { enum: ["deposit", "sweep", "route", "withdrawal", "manual", "allocation"] }).notNull(),
  title: text("title").notNull(),
  details: text("details"),
  counterparty: text("counterparty"),
  amountUSDC: real("amount_usdc").notNull(),
  direction: text("direction", { enum: ["in", "out"] }).notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).notNull().default("completed"),
  txHash: text("tx_hash"),
  source: text("source", { enum: ["user", "demo"] }).notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const spareBankTransactions = sqliteTable("spare_bank_transactions", {
  accountId: text("account_id").references(() => linkedAccounts.id),
  syncRunId: text("sync_run_id").references(() => syncRuns.id),
  externalTxId: text("external_tx_id"),
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  merchant: text("merchant").notNull(),
  amount: real("amount").notNull(),
  roundUpAmount: real("round_up_amount").notNull(),
  status: text("status", { enum: ["pending", "swept"] }).notNull().default("pending"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  occurredAt: integer("occurred_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  sweptAt: integer("swept_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});


export const taxProfiles = sqliteTable("tax_profiles", {
  walletAddress: text("wallet_address").primaryKey().references(() => users.walletAddress),
  routingPercent: real("routing_percent").notNull().default(30),
  jurisdiction: text("jurisdiction").notNull().default("US"),
  filingFrequency: text("filing_frequency", { enum: ["quarterly", "annual"] }).notNull().default("quarterly"),
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const taxReserves = sqliteTable("tax_reserves", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  balanceUSDC: real("balance_usdc").notNull().default(0),
  bonusYieldEarnedUSDC: real("bonus_yield_earned_usdc").notNull().default(0),
  lastYieldSyncAt: integer("last_yield_sync_at", { mode: "timestamp" }),
});

export const taxEvents = sqliteTable("tax_events", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  eventType: text("event_type", { enum: ["withheld", "yield_bonus", "paid"] }).notNull(),
  amountUSDC: real("amount_usdc").notNull(),
  details: text("details"),
  sourceTxId: text("source_tx_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});


export const linkedAccounts = sqliteTable("linked_accounts", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  institutionName: text("institution_name").notNull(),
  accountMask: text("account_mask").notNull(),
  status: text("status", { enum: ["active", "error", "disconnected"] }).notNull().default("active"),
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const syncRuns = sqliteTable("sync_runs", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  status: text("status", { enum: ["success", "failed"] }).notNull(),
  transactionsFound: integer("transactions_found").notNull().default(0),
  roundUpGeneratedUSDC: real("round_up_generated_usdc").notNull().default(0),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});


export const sharedAquiferParticipants = sqliteTable("shared_aquifer_participants", {
  id: text("id").primaryKey(),
  aquiferId: text("aquifer_id").notNull().references(() => aquifers.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  role: text("role", { enum: ["owner", "contributor"] }).notNull().default("contributor"),
  contributionUSDC: real("contribution_usdc").notNull().default(0),
  joinedAt: integer("joined_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const sharedAquiferInvites = sqliteTable("shared_aquifer_invites", {
  id: text("id").primaryKey(),
  aquiferId: text("aquifer_id").notNull().references(() => aquifers.id),
  inviterAddress: text("inviter_address").notNull().references(() => users.walletAddress),
  inviteeAddress: text("invitee_address"), // Optional, can be open link
  status: text("status", { enum: ["pending", "accepted", "revoked"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const prizePools = sqliteTable("prize_pools", {
  id: text("id").primaryKey(),
  status: text("status", { enum: ["open", "drawing", "completed"] }).notNull().default("open"),
  currentYieldPotUSDC: real("current_yield_pot_usdc").notNull().default(0),
  drawStartsAt: integer("draw_starts_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const prizePoolEntries = sqliteTable("prize_pool_entries", {
  id: text("id").primaryKey(),
  poolId: text("pool_id").notNull().references(() => prizePools.id),
  walletAddress: text("wallet_address").notNull().references(() => users.walletAddress),
  principalDepositedUSDC: real("principal_deposited_usdc").notNull().default(0),
  yieldContributedUSDC: real("yield_contributed_usdc").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const prizeDraws = sqliteTable("prize_draws", {
  id: text("id").primaryKey(),
  poolId: text("pool_id").notNull().references(() => prizePools.id),
  winnerAddress: text("winner_address").notNull().references(() => users.walletAddress),
  jackpotAmountUSDC: real("jackpot_amount_usdc").notNull(),
  txHash: text("tx_hash"),
  executedAt: integer("executed_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

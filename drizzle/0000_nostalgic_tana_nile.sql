CREATE TABLE `aquifer_events` (
	`id` text PRIMARY KEY NOT NULL,
	`aquifer_id` text,
	`wallet_address` text NOT NULL,
	`event_type` text NOT NULL,
	`title` text NOT NULL,
	`details` text,
	`amount_usdc` real,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`aquifer_id`) REFERENCES `aquifers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `aquifers` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'reserve' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`allocation_percent` real NOT NULL,
	`balance_usdc` real DEFAULT 0 NOT NULL,
	`required_principal_snapshot_usdc` real,
	`estimated_apy_bps` integer,
	`target_amount_usdc` real,
	`target_monthly_outflow_usdc` real,
	`target_date` integer,
	`unlock_at` integer,
	`overflow_mode` text DEFAULT 'general_balance' NOT NULL,
	`color` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `donation_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`router_id` text,
	`execution_id` text,
	`ngo_id` text,
	`wallet_address` text NOT NULL,
	`ngo_name_snapshot` text NOT NULL,
	`impact_unit_label_snapshot` text NOT NULL,
	`impact_unit_per_usdc_snapshot` real NOT NULL,
	`amount_usdc` real NOT NULL,
	`impact_value` real NOT NULL,
	`tx_hash` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`router_id`) REFERENCES `yield_routers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`execution_id`) REFERENCES `yield_router_executions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ngo_id`) REFERENCES `ngos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `linked_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`institution_name` text NOT NULL,
	`account_mask` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_sync_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ngos` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`wallet_address` text NOT NULL,
	`category` text NOT NULL,
	`impact_unit_label` text NOT NULL,
	`impact_unit_per_usdc` real NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`logo_url` text
);
--> statement-breakpoint
CREATE TABLE `prize_draws` (
	`id` text PRIMARY KEY NOT NULL,
	`pool_id` text NOT NULL,
	`winner_address` text NOT NULL,
	`jackpot_amount_usdc` real NOT NULL,
	`tx_hash` text,
	`executed_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`pool_id`) REFERENCES `prize_pools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prize_pool_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`pool_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`principal_deposited_usdc` real DEFAULT 0 NOT NULL,
	`yield_contributed_usdc` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`pool_id`) REFERENCES `prize_pools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prize_pools` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`current_yield_pot_usdc` real DEFAULT 0 NOT NULL,
	`draw_starts_at` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `shared_aquifer_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`aquifer_id` text NOT NULL,
	`inviter_address` text NOT NULL,
	`invitee_address` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`aquifer_id`) REFERENCES `aquifers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inviter_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shared_aquifer_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`aquifer_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`role` text DEFAULT 'contributor' NOT NULL,
	`contribution_usdc` real DEFAULT 0 NOT NULL,
	`joined_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`aquifer_id`) REFERENCES `aquifers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spare_bank_transactions` (
	`account_id` text,
	`sync_run_id` text,
	`external_tx_id` text,
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`merchant` text NOT NULL,
	`amount` real NOT NULL,
	`round_up_amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`occurred_at` integer DEFAULT (strftime('%s', 'now')),
	`swept_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`account_id`) REFERENCES `linked_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sync_run_id`) REFERENCES `sync_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscription_payout_executions` (
	`id` text PRIMARY KEY NOT NULL,
	`schedule_id` text NOT NULL,
	`aquifer_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`merchant_name` text NOT NULL,
	`amount_usdc` real NOT NULL,
	`status` text NOT NULL,
	`details` text,
	`scheduled_for` integer,
	`executed_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`schedule_id`) REFERENCES `subscription_payout_schedules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aquifer_id`) REFERENCES `aquifers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscription_payout_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`aquifer_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`merchant_name` text NOT NULL,
	`monthly_amount_usdc` real NOT NULL,
	`billing_day` integer NOT NULL,
	`next_payout_at` integer,
	`external_reference` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`aquifer_id`) REFERENCES `aquifers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sync_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`status` text NOT NULL,
	`transactions_found` integer DEFAULT 0 NOT NULL,
	`round_up_generated_usdc` real DEFAULT 0 NOT NULL,
	`error_message` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tax_events` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`event_type` text NOT NULL,
	`amount_usdc` real NOT NULL,
	`details` text,
	`source_tx_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tax_profiles` (
	`wallet_address` text PRIMARY KEY NOT NULL,
	`routing_percent` real DEFAULT 30 NOT NULL,
	`jurisdiction` text DEFAULT 'US' NOT NULL,
	`filing_frequency` text DEFAULT 'quarterly' NOT NULL,
	`is_enabled` integer DEFAULT false NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tax_reserves` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`balance_usdc` real DEFAULT 0 NOT NULL,
	`bonus_yield_earned_usdc` real DEFAULT 0 NOT NULL,
	`last_yield_sync_at` integer,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`details` text,
	`counterparty` text,
	`amount_usdc` real NOT NULL,
	`direction` text NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`tx_hash` text,
	`source` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`wallet_address` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `yield_router_executions` (
	`id` text PRIMARY KEY NOT NULL,
	`router_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`amount_usdc` real NOT NULL,
	`status` text NOT NULL,
	`tx_hash` text,
	`error_message` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`router_id`) REFERENCES `yield_routers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `yield_routers` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`amount_usdc` real NOT NULL,
	`ngo_id` text,
	`destination_address` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ngo_id`) REFERENCES `ngos`(`id`) ON UPDATE no action ON DELETE no action
);

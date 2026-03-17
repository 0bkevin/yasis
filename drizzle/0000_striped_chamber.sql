CREATE TABLE `pockets` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`name` text NOT NULL,
	`percentage` real NOT NULL,
	`color` text,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`wallet_address` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `yield_routers` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`amount_usdc` real NOT NULL,
	`destination_address` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);

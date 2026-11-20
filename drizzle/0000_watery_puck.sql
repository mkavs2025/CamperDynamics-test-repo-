CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slot` text,
	`status` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_active_slot` ON `bookings` (`slot`);--> statement-breakpoint
CREATE INDEX `bookings_owner` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `records_owner_kind` ON `records` (`user_id`,`kind`);--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`promo_id` text NOT NULL,
	`run_id` text NOT NULL,
	`code` text NOT NULL,
	`status` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`redeemed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reward_user_promo` ON `rewards` (`user_id`,`promo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `reward_code` ON `rewards` (`code`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shares` (
	`token` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`expires_at` text NOT NULL
);

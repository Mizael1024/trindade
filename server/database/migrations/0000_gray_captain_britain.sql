CREATE TABLE `credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text,
	`external_id` text NOT NULL,
	`public_key` blob NOT NULL,
	`sign_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credentials_external_id_unique` ON `credentials` (`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `credentials_public_key_unique` ON `credentials` (`public_key`);--> statement-breakpoint
CREATE TABLE `email_verification_codes` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`code` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`contentType` text,
	`pathname` text NOT NULL,
	`size` integer,
	`uploaded_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `oauth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`providerId` text NOT NULL,
	`providerUserId` text NOT NULL,
	`userId` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_provider_user` ON `oauth_accounts` (`providerId`,`providerUserId`);--> statement-breakpoint
CREATE TABLE `one_time_passwords` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`identifier` text NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'SIGNUP' NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`code` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`customerId` text NOT NULL,
	`status` text DEFAULT 'TRIALING' NOT NULL,
	`planId` text NOT NULL,
	`variantId` text NOT NULL,
	`paymentProvider` text NOT NULL,
	`nextPaymentDate` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`name` text NOT NULL,
	`avatarUrl` text,
	`hashedPassword` text,
	`banned` integer DEFAULT false NOT NULL,
	`bannedReason` text,
	`onboarded` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`last_active` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`referrer` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_email_unique` ON `waitlist` (`email`);
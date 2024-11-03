CREATE TABLE `audios` (
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
CREATE TABLE `cloned_voices` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`elevenLabsId` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'processing' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`elevenLabsId`) REFERENCES `elevenlabs`(`elevenLabsId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `credit_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`credits` integer NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `credit_purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`packageId` text NOT NULL,
	`credits` integer NOT NULL,
	`asaasPaymentId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`packageId`) REFERENCES `credit_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `elevenlabs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`elevenLabsId` text NOT NULL,
	`name` text NOT NULL,
	`language` text,
	`gender` text,
	`category` text NOT NULL,
	`sampleUrl` text,
	`profileUrl` text,
	`is_pro` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `elevenlabs_elevenLabsId_unique` ON `elevenlabs` (`elevenLabsId`);--> statement-breakpoint
CREATE TABLE `favorite_voices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`voice_id` text,
	`elevenLabsId` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`offer_id` text NOT NULL,
	`credits` integer NOT NULL,
	`monthly_credits` integer NOT NULL,
	`duration` integer NOT NULL,
	`type` text NOT NULL,
	`price` integer NOT NULL,
	`priceId_stripe` text,
	`productId_stripe` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `speakers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`language` text NOT NULL,
	`gender` text NOT NULL,
	`sampleUrl` text NOT NULL,
	`profileUrl` text NOT NULL,
	`visibility` text DEFAULT 'inativo' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_usage` (
	`user_id` text PRIMARY KEY NOT NULL,
	`characters_used` integer DEFAULT 0 NOT NULL,
	`characters_total` integer DEFAULT 0 NOT NULL,
	`extra_credits` integer DEFAULT 0 NOT NULL,
	`voice_clone_used` integer DEFAULT 0 NOT NULL,
	`voice_clone_total` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `voice_clone_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`credits` integer NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `voice_clone_purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`planId` text NOT NULL,
	`credits` integer NOT NULL,
	`stripePaymentId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planId`) REFERENCES `voice_clone_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`customerId` text NOT NULL,
	`subscriptionId` text NOT NULL,
	`type` text NOT NULL,
	`planId` text NOT NULL,
	`variantId` text NOT NULL,
	`status` text NOT NULL,
	`paymentProvider` text NOT NULL,
	`nextPaymentDate` integer,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_subscriptions`("id", "userId", "customerId", "subscriptionId", "type", "planId", "variantId", "status", "paymentProvider", "nextPaymentDate", "createdAt", "updatedAt") SELECT "id", "userId", "customerId", "subscriptionId", "type", "planId", "variantId", "status", "paymentProvider", "nextPaymentDate", "createdAt", "updatedAt" FROM `subscriptions`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_subscriptions` RENAME TO `subscriptions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `users` ADD `planId` text DEFAULT 'GRATIS' NOT NULL REFERENCES plans(id);
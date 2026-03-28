CREATE TABLE `fontPairFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`headingFont` varchar(100) NOT NULL,
	`bodyFont` varchar(100) NOT NULL,
	`headingWeight` varchar(20) NOT NULL,
	`bodyWeight` varchar(20) NOT NULL,
	`headingStyle` varchar(20) NOT NULL,
	`bodyStyle` varchar(20) NOT NULL,
	`name` varchar(255),
	`description` text,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fontPairFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fontPreviewCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`previewKey` varchar(255) NOT NULL,
	`headingFont` varchar(100) NOT NULL,
	`bodyFont` varchar(100) NOT NULL,
	`headingWeight` varchar(20) NOT NULL,
	`bodyWeight` varchar(20) NOT NULL,
	`headingStyle` varchar(20) NOT NULL,
	`bodyStyle` varchar(20) NOT NULL,
	`thumbnailUrl` text,
	`smallUrl` text,
	`mediumUrl` text,
	`largeUrl` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`accessCount` int DEFAULT 0,
	`lastAccessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fontPreviewCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `fontPreviewCache_previewKey_unique` UNIQUE(`previewKey`)
);
--> statement-breakpoint
ALTER TABLE `fontPairFavorites` ADD CONSTRAINT `fontPairFavorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
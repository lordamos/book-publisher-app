CREATE TABLE `bookVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`snapshot` text NOT NULL,
	`changesSummary` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`isAutoSave` int DEFAULT 0,
	`pageCount` int DEFAULT 0,
	`characterCount` int DEFAULT 0,
	CONSTRAINT `bookVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `versionMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versionId` int NOT NULL,
	`pagesAdded` int DEFAULT 0,
	`pagesDeleted` int DEFAULT 0,
	`pagesModified` int DEFAULT 0,
	`imagesAdded` int DEFAULT 0,
	`imagesDeleted` int DEFAULT 0,
	`chaptersAdded` int DEFAULT 0,
	`chaptersDeleted` int DEFAULT 0,
	`metadataChanged` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `versionMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `versionTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versionId` int NOT NULL,
	`tag` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `versionTags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookVersions` ADD CONSTRAINT `bookVersions_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookVersions` ADD CONSTRAINT `bookVersions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `versionMetadata` ADD CONSTRAINT `versionMetadata_versionId_bookVersions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `bookVersions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `versionTags` ADD CONSTRAINT `versionTags_versionId_bookVersions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `bookVersions`(`id`) ON DELETE cascade ON UPDATE no action;
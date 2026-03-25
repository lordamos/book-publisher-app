CREATE TABLE `bookImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileName` varchar(255),
	`mimeType` varchar(50),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`trimSize` varchar(50) DEFAULT '6x9',
	`pageSize` varchar(50) DEFAULT 'letter',
	`bleed` varchar(10) DEFAULT '0.125',
	`marginTop` varchar(10) DEFAULT '0.75',
	`marginBottom` varchar(10) DEFAULT '0.75',
	`marginLeft` varchar(10) DEFAULT '0.75',
	`marginRight` varchar(10) DEFAULT '0.75',
	`paperType` varchar(50) DEFAULT 'white',
	`bindingType` varchar(50) DEFAULT 'perfect',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookMetadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookMetadata_bookId_unique` UNIQUE(`bookId`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`author` varchar(255),
	`isbn` varchar(20),
	`category` varchar(100),
	`coverImageUrl` text,
	`status` enum('draft','in_progress','ready_for_export','published') NOT NULL DEFAULT 'draft',
	`pageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSavedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`startPageId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`templateType` enum('cover','chapter','full_image','text_only','blank') NOT NULL DEFAULT 'text_only',
	`content` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookImages` ADD CONSTRAINT `bookImages_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookMetadata` ADD CONSTRAINT `bookMetadata_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_startPageId_pages_id_fk` FOREIGN KEY (`startPageId`) REFERENCES `pages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pages` ADD CONSTRAINT `pages_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;
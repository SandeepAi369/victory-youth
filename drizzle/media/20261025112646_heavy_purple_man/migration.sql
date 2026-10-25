CREATE TABLE `banners` (
	`id` text PRIMARY KEY,
	`url` text NOT NULL,
	`cloudinary_public_id` text,
	`label` text DEFAULT '',
	`sort_order` integer DEFAULT 0,
	`is_published` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`file_url` text NOT NULL,
	`cloudinary_public_id` text,
	`file_size` integer,
	`file_type` text,
	`related_event_id` text,
	`expiry_date` text,
	`is_expiring_soon` integer DEFAULT false,
	`is_published` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`uploaded_by` text NOT NULL,
	`uploaded_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`title_te` text,
	`description` text,
	`description_te` text,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`cloudinary_public_id` text,
	`category` text DEFAULT 'General',
	`category_id` text,
	`year` integer DEFAULT 2026,
	`tags` text DEFAULT '[]',
	`is_published` integer DEFAULT true,
	`is_featured` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`uploaded_by` text NOT NULL,
	`uploaded_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `gallery_categories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`color` text DEFAULT '#9F1239',
	`icon` text DEFAULT 'Image',
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `hero_images` (
	`id` text PRIMARY KEY,
	`url` text NOT NULL,
	`cloudinary_public_id` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

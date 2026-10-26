CREATE TABLE `contributors` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`phone` text,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
ALTER TABLE `association_settings` ADD `public_years` text;--> statement-breakpoint
ALTER TABLE `donations` ADD `contributor_id` text REFERENCES contributors(id);--> statement-breakpoint
CREATE INDEX `contributors_name_idx` ON `contributors` (`name`);--> statement-breakpoint
CREATE INDEX `donations_contributor_idx` ON `donations` (`contributor_id`);--> statement-breakpoint
-- Backfill: one contributor profile per (name, phone) among existing donations.
-- A profile is anonymous if ANY of that person's entries was anonymous.
INSERT INTO `contributors` (`id`, `name`, `phone`, `is_anonymous`, `created_at`, `updated_at`)
SELECT 'ctr_' || lower(hex(randomblob(16))), min(trim(d.`donor_name`)), nullif(trim(min(coalesce(d.`phone`, ''))), ''),
       max(coalesce(d.`is_anonymous`, 0)), coalesce(min(d.`created_at`), unixepoch()), unixepoch()
FROM `donations` d
WHERE d.`contributor_id` IS NULL
  AND NOT EXISTS (SELECT 1 FROM `contributors` c
                  WHERE lower(c.`name`) = lower(trim(d.`donor_name`)) AND coalesce(c.`phone`, '') = trim(coalesce(d.`phone`, '')))
GROUP BY lower(trim(d.`donor_name`)), trim(coalesce(d.`phone`, ''));--> statement-breakpoint
UPDATE `donations` SET `contributor_id` = (
  SELECT c.`id` FROM `contributors` c
  WHERE lower(c.`name`) = lower(trim(`donations`.`donor_name`)) AND coalesce(c.`phone`, '') = trim(coalesce(`donations`.`phone`, ''))
  ORDER BY c.`created_at`, c.`id` LIMIT 1)
WHERE `contributor_id` IS NULL;--> statement-breakpoint
UPDATE `donations` SET `is_anonymous` = 1
WHERE `contributor_id` IN (SELECT `id` FROM `contributors` WHERE `is_anonymous` = 1);

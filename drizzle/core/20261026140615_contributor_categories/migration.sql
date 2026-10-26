ALTER TABLE `contributors` ADD `category` text DEFAULT 'DONATION' NOT NULL;--> statement-breakpoint
CREATE INDEX `contributors_category_idx` ON `contributors` (`category`);--> statement-breakpoint
-- Split: a profile with BOTH chanda and non-chanda contributions gets a separate
-- CHANDA copy (id + '_ch'); its chanda rows move there. Re-running is harmless.
INSERT OR IGNORE INTO `contributors` (`id`, `name`, `phone`, `category`, `is_anonymous`, `notes`, `created_at`, `updated_at`)
SELECT c.`id` || '_ch', c.`name`, c.`phone`, 'CHANDA', c.`is_anonymous`, c.`notes`, c.`created_at`, unixepoch()
FROM `contributors` c
WHERE EXISTS (SELECT 1 FROM `donations` d WHERE d.`contributor_id` = c.`id` AND d.`category` = 'CHANDA')
  AND EXISTS (SELECT 1 FROM `donations` d WHERE d.`contributor_id` = c.`id` AND d.`category` <> 'CHANDA');--> statement-breakpoint
UPDATE `donations` SET `contributor_id` = `contributor_id` || '_ch'
WHERE `category` = 'CHANDA'
  AND EXISTS (SELECT 1 FROM `contributors` c WHERE c.`id` = `donations`.`contributor_id` || '_ch');--> statement-breakpoint
-- Profiles whose contributions are all chanda belong to the CHANDA book
UPDATE `contributors` SET `category` = 'CHANDA'
WHERE `category` <> 'CHANDA'
  AND EXISTS (SELECT 1 FROM `donations` d WHERE d.`contributor_id` = `contributors`.`id` AND d.`category` = 'CHANDA')
  AND NOT EXISTS (SELECT 1 FROM `donations` d WHERE d.`contributor_id` = `contributors`.`id` AND d.`category` <> 'CHANDA');

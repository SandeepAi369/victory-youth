CREATE TABLE `member_payments` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`receipt_no` text NOT NULL UNIQUE,
	`amount` integer NOT NULL,
	`payment_mode` text DEFAULT 'CASH',
	`purpose` text DEFAULT 'Membership',
	`date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	CONSTRAINT `fk_member_payments_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `members` ADD `is_anonymous` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `member_payments_member_idx` ON `member_payments` (`member_id`);--> statement-breakpoint
-- Each member's current amount becomes their first payment (dated when they joined)
INSERT INTO `member_payments` (`id`, `member_id`, `receipt_no`, `amount`, `payment_mode`, `purpose`, `date`, `created_at`)
SELECT 'mpay_' || lower(hex(randomblob(16))), m.`id`, 'MEM-' || upper(hex(randomblob(5))), m.`membership_fee`, 'CASH', 'Membership',
       coalesce(m.`join_date`, date(m.`created_at`, 'unixepoch'), date('now')), coalesce(m.`created_at`, unixepoch())
FROM `members` m
WHERE coalesce(m.`membership_fee`, 0) > 0
  AND NOT EXISTS (SELECT 1 FROM `member_payments` p WHERE p.`member_id` = m.`id`);

CREATE TABLE `association_settings` (
	`id` text PRIMARY KEY DEFAULT 'settings',
	`association_name` text DEFAULT 'Victory Youth Association (Gudem Gally)' NOT NULL,
	`short_name` text DEFAULT 'Victory Youth' NOT NULL,
	`registration_no` text DEFAULT 'TS/NZB/2008/4892',
	`established_year` integer DEFAULT 1974,
	`address` text DEFAULT 'Gudem Gally, Banswada, Kamareddy Dist., Telangana - 503187',
	`president_name` text DEFAULT 'V. Rajeshwar Rao',
	`secretary_name` text DEFAULT 'Ch. Srinivas',
	`treasurer_name` text DEFAULT 'M. Laxmi Narayana',
	`contact_phone` text DEFAULT '+91 98765 43210',
	`contact_email` text DEFAULT 'contact@ganeshbns.org',
	`upi_vpa` text DEFAULT 'vya.ganesh@sbi',
	`upi_name` text DEFAULT 'Victory Youth Association Banswada',
	`upi_qr_code_url` text,
	`bank_name` text DEFAULT 'State Bank of India',
	`bank_account_no` text DEFAULT '38291048592',
	`bank_ifsc` text DEFAULT 'SBIN0001234',
	`bank_branch` text DEFAULT 'Banswada Main Branch',
	`tax_80g_no` text DEFAULT '80G/AAATV1234F/2020-21',
	`golden_jubilee_target` integer DEFAULT 2500000,
	`donation_target` integer DEFAULT 2500000,
	`chaturthi_date` text DEFAULT '2026-08-27',
	`visarjan_date` text DEFAULT '2026-09-06',
	`hero_title` text DEFAULT 'Victory Youth',
	`hero_subtitle_en` text DEFAULT '50th Golden Jubilee Celebrations',
	`hero_subtitle_te` text DEFAULT '50వ స్వర్ణోత్సవ వేడుకలు',
	`hero_description_en` text,
	`hero_description_te` text,
	`hero_image_url` text,
	`hero_image_public_id` text,
	`hero_image_alt` text DEFAULT 'Victory Youth Association',
	`featured_gallery_1_url` text,
	`featured_gallery_1_public_id` text,
	`featured_gallery_1_alt` text,
	`featured_gallery_1_caption` text,
	`featured_gallery_2_url` text,
	`featured_gallery_2_public_id` text,
	`featured_gallery_2_alt` text,
	`featured_gallery_2_caption` text,
	`featured_gallery_3_url` text,
	`featured_gallery_3_public_id` text,
	`featured_gallery_3_alt` text,
	`featured_gallery_3_caption` text,
	`facebook_url` text,
	`instagram_url` text,
	`youtube_url` text,
	`telegram_url` text,
	`whatsapp_number` text,
	`is_maintenance_mode` integer DEFAULT false,
	`updated_at` integer DEFAULT (unixepoch()),
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`event_id` text,
	`method` text DEFAULT 'QR',
	`timestamp` integer DEFAULT (unixepoch()),
	`marked_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auction_bids` (
	`id` text PRIMARY KEY,
	`auction_item_id` text NOT NULL,
	`bidder_id` text,
	`bidder_name` text NOT NULL,
	`bidder_phone` text,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `auction_items` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`title_te` text,
	`description` text,
	`description_te` text,
	`base_price` integer NOT NULL,
	`current_bid` integer DEFAULT 0,
	`reserve_price` integer,
	`highest_bidder_id` text,
	`highest_bidder_name` text,
	`highest_bidder_phone` text,
	`image_url` text,
	`cloudinary_public_id` text,
	`status` text DEFAULT 'DRAFT',
	`published_at` integer,
	`closes_at` integer,
	`closed_at` integer,
	`is_published` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`year` integer DEFAULT 2026,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY,
	`actor_member_id` text NOT NULL,
	`actor_name` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`diff` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `donation_purposes` (
	`id` text PRIMARY KEY,
	`label` text NOT NULL,
	`label_te` text,
	`description` text,
	`default_amount` integer,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` text PRIMARY KEY,
	`receipt_no` text NOT NULL UNIQUE,
	`donor_id` text,
	`donor_name` text NOT NULL,
	`phone` text NOT NULL,
	`donor_phone` text,
	`donor_email` text,
	`donor_address` text,
	`gotram` text DEFAULT 'Shiva Gotram',
	`pan_number` text,
	`amount` integer NOT NULL,
	`payment_mode` text DEFAULT 'UPI',
	`razorpay_order_id` text,
	`razorpay_payment_id` text,
	`razorpay_signature` text,
	`transaction_id` text,
	`sponsor_tier_id` text,
	`sponsor_category` text DEFAULT 'NONE',
	`purpose` text DEFAULT 'Golden Jubilee Utsav Seva',
	`category` text DEFAULT 'CHANDA',
	`purpose_id` text,
	`is_anonymous` integer DEFAULT false,
	`tax_exempt_80g` integer DEFAULT true,
	`is_published` integer DEFAULT false,
	`status` text DEFAULT 'SUCCESS',
	`collected_by` text DEFAULT 'Online UPI Portal',
	`receipt_pdf_url` text,
	`receipt_sent_at` integer,
	`date` text,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `event_categories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`color` text DEFAULT '#9F1239',
	`icon` text DEFAULT 'Calendar',
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY,
	`day` integer NOT NULL,
	`title` text NOT NULL,
	`title_te` text,
	`type` text DEFAULT 'POOJA',
	`category_id` text,
	`description` text,
	`description_te` text,
	`date` text NOT NULL,
	`timing` text NOT NULL,
	`start_time` text,
	`end_time` text,
	`location` text DEFAULT 'Gudem Gally Mandapam',
	`in_charge` text NOT NULL,
	`coordinator_id` text,
	`is_published` integer DEFAULT true,
	`publish_from` text,
	`publish_until` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `expense_approvals` (
	`id` text PRIMARY KEY,
	`transaction_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`approved_by` text,
	`status` text DEFAULT 'PENDING',
	`notes` text,
	`rejection_reason` text,
	`amount` integer NOT NULL,
	`decided_at` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`color` text DEFAULT '#9F1239',
	`icon` text DEFAULT 'Receipt',
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `important_notes` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text DEFAULT 'general',
	`tags` text DEFAULT '[]',
	`author_name` text NOT NULL,
	`is_pinned` integer DEFAULT false,
	`is_published` integer DEFAULT true,
	`version` integer DEFAULT 1,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`category_id` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`available` integer DEFAULT 1,
	`issued` integer DEFAULT 0,
	`total` integer DEFAULT 1,
	`unit` text DEFAULT 'pieces',
	`condition` text DEFAULT 'Good',
	`location` text DEFAULT 'Association Store Room',
	`is_rented` integer DEFAULT false,
	`rental_vendor` text,
	`rental_vendor_id` text,
	`rental_cost` integer DEFAULT 0,
	`return_due_date` text,
	`purchase_date` text,
	`purchase_cost` integer,
	`in_charge` text NOT NULL,
	`low_stock_threshold` integer DEFAULT 5,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY,
	`clerk_user_id` text,
	`member_id` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`full_name` text,
	`father_name` text,
	`phone` text NOT NULL,
	`mobile` text,
	`email` text,
	`gotram` text,
	`address` text DEFAULT 'Gudem Gally, Banswada',
	`family_details` text DEFAULT '{}',
	`qr_code` text,
	`membership_type` text DEFAULT 'GENERAL',
	`membership_fee` integer DEFAULT 5000,
	`fee_status` text DEFAULT 'PAID',
	`join_date` text,
	`member_since` text DEFAULT '2026',
	`committee_role` text DEFAULT 'MEMBER',
	`role` text DEFAULT 'MEMBER',
	`telugu_pref` integer DEFAULT true,
	`photo_url` text,
	`attendance_count` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`is_id_card_issued` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`channel` text DEFAULT 'TELEGRAM',
	`channels` text DEFAULT '[]',
	`audience` text DEFAULT 'ALL',
	`status` text DEFAULT 'DRAFT',
	`is_pinned` integer DEFAULT false,
	`expires_at` integer,
	`sent_at` integer,
	`sent_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `roles_audit` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`old_role` text NOT NULL,
	`new_role` text NOT NULL,
	`changed_by` text NOT NULL,
	`reason` text,
	`changed_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `sponsor_tiers` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`min_amount` integer DEFAULT 0 NOT NULL,
	`max_amount` integer,
	`color` text DEFAULT '#FACC15',
	`badge_icon` text,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`tier` text NOT NULL,
	`tier_id` text,
	`amount` integer NOT NULL,
	`donation_id` text,
	`logo_url` text,
	`contact_phone` text,
	`contact_email` text,
	`contact_person` text,
	`year` integer DEFAULT 2026,
	`is_published` integer DEFAULT true,
	`display_order` integer DEFAULT 1,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY,
	`voucher_no` text NOT NULL UNIQUE,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`category_id` text,
	`amount` integer NOT NULL,
	`mode` text DEFAULT 'BANK_TRANSFER',
	`related_donation_id` text,
	`related_expense_id` text,
	`receipt_url` text,
	`notes` text,
	`title` text,
	`description` text,
	`paid_to` text,
	`vendor_name` text,
	`vendor_id` text,
	`approved_by` text,
	`is_published` integer DEFAULT false,
	`status` text DEFAULT 'APPROVED',
	`recorded_by` text NOT NULL,
	`date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `volunteer_duties` (
	`id` text PRIMARY KEY,
	`event_id` text,
	`volunteer_id` text,
	`volunteer_name` text NOT NULL,
	`role` text NOT NULL,
	`task` text,
	`shift` text NOT NULL,
	`shift_start` text,
	`shift_end` text,
	`location` text DEFAULT 'Mandapam Premises',
	`status` text DEFAULT 'ASSIGNED',
	`checked_in_at` integer,
	`checked_out_at` integer,
	`created_at` integer DEFAULT (unixepoch())
);

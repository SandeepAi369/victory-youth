import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const auctionStatusEnum = pgEnum("auction_status", [
  "DRAFT",
  "LIVE",
  "CLOSED",
]);

export const noticeStatusEnum = pgEnum("notice_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const expenseStatusEnum = pgEnum("expense_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PAID",
]);

// ============================================
// 1. ASSOCIATION SETTINGS (NEW - Single row table)
// ============================================

export const associationSettings = pgTable("association_settings", {
  id: text("id").primaryKey().default("settings"),
  
  // Basic Info
  associationName: text("association_name").notNull().default("Victory Youth Association (Gudem Gally)"),
  shortName: text("short_name").notNull().default("Victory Youth"),
  registrationNo: text("registration_no").default("TS/NZB/2008/4892"),
  establishedYear: integer("established_year").default(1974),
  
  // Address
  address: text("address").default("Gudem Gally, Banswada, Kamareddy Dist., Telangana - 503187"),
  
  // Office Bearers
  presidentName: text("president_name").default("V. Rajeshwar Rao"),
  secretaryName: text("secretary_name").default("Ch. Srinivas"),
  treasurerName: text("treasurer_name").default("M. Laxmi Narayana"),
  
  // Contact
  contactPhone: text("contact_phone").default("+91 98765 43210"),
  contactEmail: text("contact_email").default("contact@ganeshbns.org"),
  
  // UPI Details
  upiVpa: text("upi_vpa").default("vya.ganesh@sbi"),
  upiName: text("upi_name").default("Victory Youth Association Banswada"),
  upiQrCodeUrl: text("upi_qr_code_url"),
  
  // Bank Details
  bankName: text("bank_name").default("State Bank of India"),
  bankAccountNo: text("bank_account_no").default("38291048592"),
  bankIfsc: text("bank_ifsc").default("SBIN0001234"),
  bankBranch: text("bank_branch").default("Banswada Main Branch"),
  
  // Tax & Target
  tax80GNo: text("tax_80g_no").default("80G/AAATV1234F/2020-21"),
  goldenJubileeTarget: integer("golden_jubilee_target").default(2500000),
  donationTarget: integer("donation_target").default(2500000),
  
  // Festival Dates
  chaturthiDate: text("chaturthi_date").default("2026-08-27"),
  visarjanDate: text("visarjan_date").default("2026-09-06"),
  
  // Hero Section Content
  heroTitle: text("hero_title").default("Victory Youth"),
  heroSubtitleEn: text("hero_subtitle_en").default("50th Golden Jubilee Celebrations"),
  heroSubtitleTe: text("hero_subtitle_te").default("50వ స్వర్ణోత్సవ వేడుకలు"),
  heroDescriptionEn: text("hero_description_en"),
  heroDescriptionTe: text("hero_description_te"),
  
  // Hero Image (Dynamic - Admin Controllable)
  heroImageUrl: text("hero_image_url"),
  heroImagePublicId: text("hero_image_public_id"),
  heroImageAlt: text("hero_image_alt").default("Victory Youth Association"),
  
  // Featured Gallery (3 Photos - Admin Controllable)
  featuredGallery1Url: text("featured_gallery_1_url"),
  featuredGallery1PublicId: text("featured_gallery_1_public_id"),
  featuredGallery1Alt: text("featured_gallery_1_alt"),
  featuredGallery1Caption: text("featured_gallery_1_caption"),
  
  featuredGallery2Url: text("featured_gallery_2_url"),
  featuredGallery2PublicId: text("featured_gallery_2_public_id"),
  featuredGallery2Alt: text("featured_gallery_2_alt"),
  featuredGallery2Caption: text("featured_gallery_2_caption"),
  
  featuredGallery3Url: text("featured_gallery_3_url"),
  featuredGallery3PublicId: text("featured_gallery_3_public_id"),
  featuredGallery3Alt: text("featured_gallery_3_alt"),
  featuredGallery3Caption: text("featured_gallery_3_caption"),
  
  // Social Links
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  telegramUrl: text("telegram_url"),
  whatsappNumber: text("whatsapp_number"),
  
  // System
  isMaintenanceMode: boolean("is_maintenance_mode").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),
});

// ============================================
// 2. MEMBERS TABLE
// ============================================

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id"),
  memberId: text("member_id").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name"),
  fatherName: text("father_name"),
  phone: text("phone").notNull(),
  mobile: text("mobile"),
  email: text("email"),
  gotram: text("gotram"),
  address: text("address").default("Gudem Gally, Banswada"),
  familyDetails: jsonb("family_details").default({}),
  qrCode: text("qr_code"),
  membershipType: text("membership_type").default("GENERAL"),
  membershipFee: integer("membership_fee").default(5000),
  feeStatus: text("fee_status").default("PAID"),
  joinDate: text("join_date"),
  memberSince: text("member_since").default("2026"),
  committeeRole: text("committee_role").default("MEMBER"),
  role: text("role").default("MEMBER"),
  teluguPref: boolean("telugu_pref").default(true),
  photoUrl: text("photo_url"),
  attendanceCount: integer("attendance_count").default(0),
  
  // Visibility & Status
  isActive: boolean("is_active").default(true),
  isIdCardIssued: boolean("is_id_card_issued").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 3. ROLES AUDIT TABLE
// ============================================

export const rolesAudit = pgTable("roles_audit", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull(),
  oldRole: text("old_role").notNull(),
  newRole: text("new_role").notNull(),
  changedBy: text("changed_by").notNull(),
  reason: text("reason"),
  changedAt: timestamp("changed_at").defaultNow(),
});

// ============================================
// 4. DONATIONS TABLE
// ============================================

export const donations = pgTable("donations", {
  id: text("id").primaryKey(),
  receiptNo: text("receipt_no").notNull().unique(),
  donorId: text("donor_id"),
  donorName: text("donor_name").notNull(),
  phone: text("phone").notNull(),
  donorPhone: text("donor_phone"),
  donorEmail: text("donor_email"),
  donorAddress: text("donor_address"),
  gotram: text("gotram").default("Shiva Gotram"),
  panNumber: text("pan_number"),
  
  amount: integer("amount").notNull(),
  paymentMode: text("payment_mode").default("UPI"),
  
  // Razorpay Integration
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  transactionId: text("transaction_id"),
  
  // Sponsorship
  sponsorTierId: text("sponsor_tier_id"),
  sponsorCategory: text("sponsor_category").default("NONE"),
  
  purpose: text("purpose").default("Golden Jubilee Utsav Seva"),
  category: text("category").default("CHANDA"), // CHANDA, DONATION, SPONSORSHIP, ANNADANAM, OTHER
  purposeId: text("purpose_id"),
  
  isAnonymous: boolean("is_anonymous").default(false),
  taxExempt80G: boolean("tax_exempt_80g").default(true),
  
  isPublished: boolean("is_published").default(false),
  status: text("status").default("SUCCESS"),
  collectedBy: text("collected_by").default("Online UPI Portal"),
  
  // Receipt
  receiptPdfUrl: text("receipt_pdf_url"),
  receiptSentAt: timestamp("receipt_sent_at"),
  
  date: text("date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 5. TRANSACTIONS (Ledger & Cash Book)
// ============================================

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  voucherNo: text("voucher_no").notNull().unique(),
  type: text("type").notNull(), // INCOME, EXPENSE
  category: text("category").notNull(),
  categoryId: text("category_id"),
  
  amount: integer("amount").notNull(),
  mode: text("mode").default("BANK_TRANSFER"),
  
  // References
  relatedDonationId: text("related_donation_id"),
  relatedExpenseId: text("related_expense_id"),
  
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  title: text("title"),
  description: text("description"),
  
  // Vendor/Payee
  paidTo: text("paid_to"),
  vendorName: text("vendor_name"),
  vendorId: text("vendor_id"),
  
  // Approval Workflow
  approvedBy: text("approved_by"),
  isPublished: boolean("is_published").default(false),
  status: text("status").default("APPROVED"),
  
  recordedBy: text("recorded_by").notNull(),
  date: text("date").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 6. EXPENSE APPROVALS
// ============================================

export const expenseApprovals = pgTable("expense_approvals", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").notNull(),
  requestedBy: text("requested_by").notNull(),
  approvedBy: text("approved_by"),
  status: expenseStatusEnum("status").default("PENDING"),
  notes: text("notes"),
  rejectionReason: text("rejection_reason"),
  amount: integer("amount").notNull(),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 7. EVENTS TABLE
// ============================================

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  titleTe: text("title_te"), // Telugu title
  type: text("type").default("POOJA"),
  categoryId: text("category_id"),
  
  description: text("description"),
  descriptionTe: text("description_te"),
  
  date: text("date").notNull(),
  timing: text("timing").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location").default("Gudem Gally Mandapam"),
  
  inCharge: text("in_charge").notNull(),
  coordinatorId: text("coordinator_id"),
  
  // Visibility
  isPublished: boolean("is_published").default(true),
  publishFrom: text("publish_from"),
  publishUntil: text("publish_until"),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 8. VOLUNTEER DUTIES
// ============================================

export const volunteerDuties = pgTable("volunteer_duties", {
  id: text("id").primaryKey(),
  eventId: text("event_id"),
  volunteerId: text("volunteer_id"),
  volunteerName: text("volunteer_name").notNull(),
  role: text("role").notNull(),
  task: text("task"),
  
  shift: text("shift").notNull(),
  shiftStart: text("shift_start"),
  shiftEnd: text("shift_end"),
  location: text("location").default("Mandapam Premises"),
  
  status: text("status").default("ASSIGNED"),
  checkedInAt: timestamp("checked_in_at"),
  checkedOutAt: timestamp("checked_out_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 9. ATTENDANCE
// ============================================

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull(),
  eventId: text("event_id"),
  method: text("method").default("QR"),
  timestamp: timestamp("timestamp").defaultNow(),
  markedBy: text("marked_by").notNull(),
});

// ============================================
// 10. INVENTORY ITEMS
// ============================================

export const inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  categoryId: text("category_id"),
  
  quantity: integer("quantity").notNull().default(1),
  available: integer("available").default(1),
  issued: integer("issued").default(0),
  total: integer("total").default(1),
  unit: text("unit").default("pieces"),
  
  condition: text("condition").default("Good"),
  location: text("location").default("Association Store Room"),
  
  // Rental Info
  isRented: boolean("is_rented").default(false),
  rentalVendor: text("rental_vendor"),
  rentalVendorId: text("rental_vendor_id"),
  rentalCost: integer("rental_cost").default(0),
  returnDueDate: text("return_due_date"),
  
  // Purchase Info
  purchaseDate: text("purchase_date"),
  purchaseCost: integer("purchase_cost"),
  
  inCharge: text("in_charge").notNull(),
  
  // Alerts
  lowStockThreshold: integer("low_stock_threshold").default(5),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 11. DOCUMENTS TABLE
// ============================================

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  
  fileUrl: text("file_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  
  relatedEventId: text("related_event_id"),
  
  // Expiry
  expiryDate: text("expiry_date"),
  isExpiringSoon: boolean("is_expiring_soon").default(false),
  
  // Visibility
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").default(0),
  
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 12. NOTICES TABLE
// ============================================

export const notices = pgTable("notices", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  
  // Broadcast Channels
  channel: text("channel").default("TELEGRAM"), // TELEGRAM, WHATSAPP, EMAIL, SMS, ALL
  channels: jsonb("channels").default([]), // ["TELEGRAM", "WHATSAPP"]
  
  audience: text("audience").default("ALL"), // ALL, MEMBERS, VOLUNTEERS, COMMITTEE
  
  // Status & Visibility
  status: noticeStatusEnum("status").default("DRAFT"),
  isPinned: boolean("is_pinned").default(false),
  expiresAt: timestamp("expires_at"),
  
  sentAt: timestamp("sent_at"),
  sentBy: text("sent_by").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 13. SPONSORS TABLE
// ============================================

export const sponsors = pgTable("sponsors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  tierId: text("tier_id"),
  
  amount: integer("amount").notNull(),
  donationId: text("donation_id"),
  
  logoUrl: text("logo_url"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contactPerson: text("contact_person"),
  
  year: integer("year").default(2026),
  
  // Visibility
  isPublished: boolean("is_published").default(true),
  displayOrder: integer("display_order").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 14. GALLERY TABLE (NEW)
// ============================================

export const gallery = pgTable("gallery", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleTe: text("title_te"),
  description: text("description"),
  descriptionTe: text("description_te"),
  
  // Image
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  cloudinaryPublicId: text("cloudinary_public_id"),
  
  // Categorization
  category: text("category").default("General"),
  categoryId: text("category_id"),
  year: integer("year").default(2026),
  
  // Tags for search
  tags: jsonb("tags").default([]),
  
  // Visibility
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 15. AUCTION ITEMS TABLE
// ============================================

export const auctionItems = pgTable("auction_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleTe: text("title_te"),
  description: text("description"),
  descriptionTe: text("description_te"),
  
  // Pricing
  basePrice: integer("base_price").notNull(),
  currentBid: integer("current_bid").default(0),
  reservePrice: integer("reserve_price"),
  
  // Winner
  highestBidderId: text("highest_bidder_id"),
  highestBidderName: text("highest_bidder_name"),
  highestBidderPhone: text("highest_bidder_phone"),
  
  // Image
  imageUrl: text("image_url"),
  cloudinaryPublicId: text("cloudinary_public_id"),
  
  // Status & Lifecycle
  status: auctionStatusEnum("status").default("DRAFT"),
  publishedAt: timestamp("published_at"),
  closesAt: timestamp("closes_at"),
  closedAt: timestamp("closed_at"),
  
  // Visibility
  isPublished: boolean("is_published").default(false),
  sortOrder: integer("sort_order").default(0),
  
  year: integer("year").default(2026),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 16. AUCTION BIDS TABLE (NEW - Track bid history)
// ============================================

export const auctionBids = pgTable("auction_bids", {
  id: text("id").primaryKey(),
  auctionItemId: text("auction_item_id").notNull(),
  
  bidderId: text("bidder_id"),
  bidderName: text("bidder_name").notNull(),
  bidderPhone: text("bidder_phone"),
  
  amount: integer("amount").notNull(),
  
  status: text("status").default("ACTIVE"), // ACTIVE, OUTBID, WINNING, WON
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 17. AUDIT LOG TABLE
// ============================================

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  actorMemberId: text("actor_member_id").notNull(),
  actorName: text("actor_name"),
  action: text("action").notNull(),
  
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  diff: jsonb("diff"), // Computed diff for easy viewing
  
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ============================================
// CATEGORY TABLES (NEW - Admin manageable)
// ============================================

// 18. Expense Categories
export const expenseCategories = pgTable("expense_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#9F1239"), // Hex color for UI
  icon: text("icon").default("Receipt"), // Lucide icon name
  
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 19. Sponsor Tiers
export const sponsorTiers = pgTable("sponsor_tiers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "Maha Raja Patron", "Diamond Patron", etc.
  slug: text("slug").notNull().unique(),
  description: text("description"),
  
  minAmount: integer("min_amount").notNull().default(0),
  maxAmount: integer("max_amount"),
  
  color: text("color").default("#FACC15"), // Hex color for UI
  badgeIcon: text("badge_icon"),
  
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 20. Event Categories
export const eventCategories = pgTable("event_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#9F1239"),
  icon: text("icon").default("Calendar"),
  
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 21. Gallery Categories
export const galleryCategories = pgTable("gallery_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#9F1239"),
  icon: text("icon").default("Image"),
  
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 22. Donation Purposes
export const donationPurposes = pgTable("donation_purposes", {
  id: text("id").primaryKey(),
  label: text("label").notNull(), // "Annadanam Sponsorship"
  labelTe: text("label_te"), // Telugu label
  description: text("description"),
  defaultAmount: integer("default_amount"),
  
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 23. IMPORTANT NOTES TABLE (NEW - Documentation Module)
// ============================================

export const importantNotes = pgTable("important_notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Rich text/JSON content
  
  // Metadata
  category: text("category").default("general"), // "general", "financial", "event", "committee", etc.
  tags: jsonb("tags").default([]), // Array of tags for filtering
  
  // Author & Status
  authorName: text("author_name").notNull(),
  
  isPinned: boolean("is_pinned").default(false), // Pinned notes appear at top
  isPublished: boolean("is_published").default(true),
  
  // Versioning
  version: integer("version").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// TYPE EXPORTS
// ============================================

// Settings
export type AssociationSettingsRow = InferSelectModel<typeof associationSettings>;
export type NewAssociationSettingsRow = InferInsertModel<typeof associationSettings>;

// Members
export type MemberRow = InferSelectModel<typeof members>;
export type NewMemberRow = InferInsertModel<typeof members>;

// Donations
export type DonationRow = InferSelectModel<typeof donations>;
export type NewDonationRow = InferInsertModel<typeof donations>;

// Transactions
export type TransactionRow = InferSelectModel<typeof transactions>;
export type NewTransactionRow = InferInsertModel<typeof transactions>;

// Events
export type EventRow = InferSelectModel<typeof events>;
export type NewEventRow = InferInsertModel<typeof events>;

// Inventory
export type InventoryItemRow = InferSelectModel<typeof inventoryItems>;
export type NewInventoryItemRow = InferInsertModel<typeof inventoryItems>;

// Documents
export type DocumentRow = InferSelectModel<typeof documents>;
export type NewDocumentRow = InferInsertModel<typeof documents>;

// Notices
export type NoticeRow = InferSelectModel<typeof notices>;
export type NewNoticeRow = InferInsertModel<typeof notices>;

// Sponsors
export type SponsorRow = InferSelectModel<typeof sponsors>;
export type NewSponsorRow = InferInsertModel<typeof sponsors>;

// Gallery
export type GalleryRow = InferSelectModel<typeof gallery>;
export type NewGalleryRow = InferInsertModel<typeof gallery>;

// Auction Items
export type AuctionItemRow = InferSelectModel<typeof auctionItems>;
export type NewAuctionItemRow = InferInsertModel<typeof auctionItems>;

// Auction Bids
export type AuctionBidRow = InferSelectModel<typeof auctionBids>;
export type NewAuctionBidRow = InferInsertModel<typeof auctionBids>;

// Audit Log
export type AuditLogRow = InferSelectModel<typeof auditLog>;
export type NewAuditLogRow = InferInsertModel<typeof auditLog>;

// Categories
export type ExpenseCategoryRow = InferSelectModel<typeof expenseCategories>;
export type SponsorTierRow = InferSelectModel<typeof sponsorTiers>;
export type EventCategoryRow = InferSelectModel<typeof eventCategories>;
export type GalleryCategoryRow = InferSelectModel<typeof galleryCategories>;
export type DonationPurposeRow = InferSelectModel<typeof donationPurposes>;

// Important Notes
export type ImportantNoteRow = InferSelectModel<typeof importantNotes>;
export type NewImportantNoteRow = InferInsertModel<typeof importantNotes>;

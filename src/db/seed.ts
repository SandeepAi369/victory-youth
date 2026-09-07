import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  console.error("No DATABASE_URL found.");
  process.exit(1);
}

const db = drizzle(connectionString, { schema });

// Helper to generate unique IDs
const generateId = (prefix: string, num: number) => `${prefix}_${num.toString().padStart(4, "0")}`;

async function seed() {
  console.log("🌱 Starting comprehensive database seed...");
  console.log("📍 Target: CockroachDB Serverless");

  try {
    // ============================================
    // 1. ASSOCIATION SETTINGS (Single row)
    // ============================================
    console.log("\n📋 Seeding association_settings...");
    await db.insert(schema.associationSettings).values({
      id: "settings",
      associationName: "Victory Youth Association (Gudem Gally)",
      shortName: "Victory Youth",
      registrationNo: "TS/NZB/2008/4892",
      establishedYear: 1974,
      address: "Gudem Gally, Banswada, Kamareddy Dist., Telangana - 503187",
      presidentName: "V. Rajeshwar Rao",
      secretaryName: "Ch. Srinivas",
      treasurerName: "M. Laxmi Narayana",
      contactPhone: "+91 98765 43210",
      contactEmail: "contact@ganeshbns.org",
      upiVpa: "vya.ganesh@sbi",
      upiName: "Victory Youth Association Banswada",
      bankName: "State Bank of India",
      bankAccountNo: "38291048592",
      bankIfsc: "SBIN0001234",
      bankBranch: "Banswada Main Branch",
      tax80GNo: "80G/AAATV1234F/2020-21",
      goldenJubileeTarget: 2500000,
      donationTarget: 2500000,
      chaturthiDate: "2026-08-27",
      visarjanDate: "2026-09-06",
      heroTitleEn: "Victory Youth",
      heroTitleTe: "బాన్స్‌వాడ కా రాజా",
      heroSubtitleEn: "50th Golden Jubilee Celebrations",
      heroSubtitleTe: "50వ స్వర్ణోత్సవ వేడుకలు",
      heroDescriptionEn: "Join us for the grand 50th Golden Jubilee celebrations of Banswada Ka Raja. Eleven days of devotion, culture, and community service.",
      heroDescriptionTe: "బాన్స్‌వాడ కా రాజా 50వ స్వర్ణోత్సవ వేడుకలలో మీరు కూడా పాల్గొనండి.",
      facebookUrl: "https://facebook.com/ganeshbns",
      instagramUrl: "https://instagram.com/ganeshbns",
      youtubeUrl: "https://youtube.com/@ganeshbns",
      telegramUrl: "https://t.me/ganeshbns",
      whatsappNumber: "+919876543210",
      isMaintenanceMode: false,
      updatedBy: "SYSTEM",
    }).onConflictDoNothing();

    // ============================================
    // 2. CATEGORIES (Master data first)
    // ============================================
    console.log("\n📂 Seeding categories...");

    // Expense Categories
    const expenseCategoriesData = [
      { id: "ec_0001", name: "Mandapam & Stage", slug: "mandapam-stage", color: "#9F1239", icon: "Home", sortOrder: 1 },
      { id: "ec_0002", name: "Idol & Decoration", slug: "idol-decoration", color: "#F59E0B", icon: "Sparkles", sortOrder: 2 },
      { id: "ec_0003", name: "Sound & Lights", slug: "sound-lights", color: "#3B82F6", icon: "Music", sortOrder: 3 },
      { id: "ec_0004", name: "Pooja Samagri", slug: "pooja-samagri", color: "#10B981", icon: "Flame", sortOrder: 4 },
      { id: "ec_0005", name: "Annadanam", slug: "annadanam", color: "#F97316", icon: "UtensilsCrossed", sortOrder: 5 },
      { id: "ec_0006", name: "Transportation", slug: "transportation", color: "#6366F1", icon: "Truck", sortOrder: 6 },
      { id: "ec_0007", name: "Security & Permissions", slug: "security-permissions", color: "#EF4444", icon: "Shield", sortOrder: 7 },
      { id: "ec_0008", name: "Printing & Stationery", slug: "printing-stationery", color: "#8B5CF6", icon: "Printer", sortOrder: 8 },
      { id: "ec_0009", name: "Volunteer Expenses", slug: "volunteer-expenses", color: "#EC4899", icon: "Users", sortOrder: 9 },
      { id: "ec_0010", name: "Visarjan", slug: "visarjan", color: "#14B8A6", icon: "Waves", sortOrder: 10 },
    ];

    for (const cat of expenseCategoriesData) {
      await db.insert(schema.expenseCategories).values(cat).onConflictDoNothing();
    }

    // Sponsor Tiers
    const sponsorTiersData = [
      { id: "st_0001", name: "Maha Raja Patron", slug: "maha-raja-patron", minAmount: 100000, color: "#FFD700", sortOrder: 1 },
      { id: "st_0002", name: "Diamond Patron", slug: "diamond-patron", minAmount: 50000, maxAmount: 99999, color: "#60A5FA", sortOrder: 2 },
      { id: "st_0003", name: "Gold Patron", slug: "gold-patron", minAmount: 25000, maxAmount: 49999, color: "#FACC15", sortOrder: 3 },
      { id: "st_0004", name: "Silver Patron", slug: "silver-patron", minAmount: 10000, maxAmount: 24999, color: "#9CA3AF", sortOrder: 4 },
      { id: "st_0005", name: "Bronze Patron", slug: "bronze-patron", minAmount: 5000, maxAmount: 9999, color: "#D97706", sortOrder: 5 },
      { id: "st_0006", name: "General Donor", slug: "general-donor", minAmount: 1, maxAmount: 4999, color: "#78716C", sortOrder: 6 },
    ];

    for (const tier of sponsorTiersData) {
      await db.insert(schema.sponsorTiers).values(tier).onConflictDoNothing();
    }

    // Event Categories
    const eventCategoriesData = [
      { id: "evc_0001", name: "Pooja & Homam", slug: "pooja-homam", color: "#9F1239", icon: "Flame", sortOrder: 1 },
      { id: "evc_0002", name: "Aarti", slug: "aarti", color: "#F59E0B", icon: "Sun", sortOrder: 2 },
      { id: "evc_0003", name: "Annadanam", slug: "annadanam", color: "#10B981", icon: "UtensilsCrossed", sortOrder: 3 },
      { id: "evc_0004", name: "Cultural Program", slug: "cultural-program", color: "#6366F1", icon: "Music", sortOrder: 4 },
      { id: "evc_0005", name: "Procession", slug: "procession", color: "#EC4899", icon: "Users", sortOrder: 5 },
      { id: "evc_0006", name: "Visarjan", slug: "visarjan", color: "#14B8A6", icon: "Waves", sortOrder: 6 },
    ];

    for (const cat of eventCategoriesData) {
      await db.insert(schema.eventCategories).values(cat).onConflictDoNothing();
    }

    // Gallery Categories
    const galleryCategoriesData = [
      { id: "glc_0001", name: "Aarti", slug: "aarti", color: "#F59E0B", icon: "Sun", sortOrder: 1 },
      { id: "glc_0002", name: "Visarjan", slug: "visarjan", color: "#14B8A6", icon: "Waves", sortOrder: 2 },
      { id: "glc_0003", name: "Annadanam", slug: "annadanam", color: "#10B981", icon: "UtensilsCrossed", sortOrder: 3 },
      { id: "glc_0004", name: "Auction", slug: "auction", color: "#6366F1", icon: "Gavel", sortOrder: 4 },
      { id: "glc_0005", name: "Mandapam", slug: "mandapam", color: "#9F1239", icon: "Home", sortOrder: 5 },
      { id: "glc_0006", name: "Procession", slug: "procession", color: "#EC4899", icon: "Users", sortOrder: 6 },
    ];

    for (const cat of galleryCategoriesData) {
      await db.insert(schema.galleryCategories).values(cat).onConflictDoNothing();
    }

    // Donation Purposes
    const donationPurposesData = [
      { id: "dp_0001", label: "Golden Jubilee Utsav Seva", labelTe: "స్వర్ణోత్సవ ఉత్సవ సేవ", defaultAmount: 5000, sortOrder: 1 },
      { id: "dp_0002", label: "Annadanam Sponsorship", labelTe: "అన్నదానం స్పాన్సర్‌షిప్", defaultAmount: 10000, sortOrder: 2 },
      { id: "dp_0003", label: "Laddu Prasadam Seva", labelTe: "లడ్డు ప్రసాదం సేవ", defaultAmount: 2500, sortOrder: 3 },
      { id: "dp_0004", label: "Daily Pooja Seva", labelTe: "దైనందిన పూజ సేవ", defaultAmount: 1100, sortOrder: 4 },
      { id: "dp_0005", label: "Lighting & Decoration", labelTe: "లైటింగ్ & డెకరేషన్", defaultAmount: 5000, sortOrder: 5 },
      { id: "dp_0006", label: "Idol Adornment", labelTe: "విగ్రహ అలంకరణ", defaultAmount: 15000, sortOrder: 6 },
      { id: "dp_0007", label: "Sound System Seva", labelTe: "సౌండ్ సిస్టమ్ సేవ", defaultAmount: 20000, sortOrder: 7 },
      { id: "dp_0008", label: "Visarjan Procession", labelTe: "విసర్జన ఊరేగింపు", defaultAmount: 25000, sortOrder: 8 },
    ];

    for (const purpose of donationPurposesData) {
      await db.insert(schema.donationPurposes).values(purpose).onConflictDoNothing();
    }

    // ============================================
    // 3. MEMBERS
    // ============================================
    console.log("\n👥 Seeding members...");
    const membersData = [
      { id: "mem_0001", memberId: "VYA-001", name: "K. Sandeep Raju", fullName: "Kummari Sandeep Raju", fatherName: "K. Rama Rao", phone: "9876543210", gotram: "Shiva Gotram", email: "sandeep@ganeshbns.org", bloodGroup: "O+", address: "H.No. 1-2-45, Gudem Gally, Banswada", membershipType: "LIFETIME", membershipFee: 10000, feeStatus: "PAID", committeeRole: "SUPER_ADMIN", role: "SUPER_ADMIN", memberSince: "2008", attendanceCount: 48, isActive: true },
      { id: "mem_0002", memberId: "VYA-002", name: "V. Rajeshwar Rao", fullName: "Vadapalli Rajeshwar Rao", fatherName: "V. Satyanarayana", phone: "9440112345", gotram: "Kashyapa", email: "rajeshwar@ganeshbns.org", bloodGroup: "B+", address: "H.No. 2-3-78, Main Road, Banswada", membershipType: "LIFETIME", membershipFee: 10000, feeStatus: "PAID", committeeRole: "PRESIDENT", role: "PRESIDENT", memberSince: "1990", attendanceCount: 52, isActive: true },
      { id: "mem_0003", memberId: "VYA-003", name: "M. Laxmi Narayana", fullName: "Madugula Laxmi Narayana", fatherName: "M. Gourishankar", phone: "9849054321", gotram: "Bharadwaja", email: "laxmi@ganeshbns.org", bloodGroup: "A+", address: "H.No. 3-4-12, Temple Street, Banswada", membershipType: "LIFETIME", membershipFee: 10000, feeStatus: "PAID", committeeRole: "TREASURER", role: "TREASURER", memberSince: "1995", attendanceCount: 50, isActive: true },
      { id: "mem_0004", memberId: "VYA-004", name: "Ch. Srinivas", fullName: "Chitkula Srinivas", fatherName: "Ch. Narasimha", phone: "9989098765", gotram: "Vasishtha", email: "srinivas@ganeshbns.org", bloodGroup: "O-", address: "H.No. 4-5-34, Market Area, Banswada", membershipType: "LIFETIME", membershipFee: 10000, feeStatus: "PAID", committeeRole: "SECRETARY", role: "SECRETARY", memberSince: "2002", attendanceCount: 46, isActive: true },
      { id: "mem_0005", memberId: "VYA-005", name: "P. Ramesh Kumar", fullName: "Pothuganti Ramesh Kumar", fatherName: "P. Ramachandram", phone: "9701234567", gotram: "Shiva Gotram", email: "ramesh@ganeshbns.org", bloodGroup: "AB+", address: "H.No. 5-6-89, Station Road, Banswada", membershipType: "ANNUAL", membershipFee: 5000, feeStatus: "PAID", committeeRole: "EVENT_INCHARGE", role: "EVENT_INCHARGE", memberSince: "2008", attendanceCount: 42, isActive: true },
      { id: "mem_0006", memberId: "VYA-006", name: "A. Suresh Reddy", fullName: "Anugu Suresh Reddy", fatherName: "A. Narsimha Reddy", phone: "9848012345", gotram: "Kashyapa", email: "suresh@ganeshbns.org", bloodGroup: "B-", address: "H.No. 6-7-23, Gudem Gally, Banswada", membershipType: "ANNUAL", membershipFee: 5000, feeStatus: "PAID", committeeRole: "COMMITTEE_MEMBER", role: "COMMITTEE_MEMBER", memberSince: "2010", attendanceCount: 38, isActive: true },
      { id: "mem_0007", memberId: "VYA-007", name: "V. Santosh Kumar", fullName: "Vadapalli Santosh Kumar", fatherName: "V. Rajeshwar Rao", phone: "9490123456", gotram: "Kashyapa", email: "santosh@ganeshbns.org", bloodGroup: "O+", address: "H.No. 2-3-78, Main Road, Banswada", membershipType: "ANNUAL", membershipFee: 3000, feeStatus: "PAID", committeeRole: "VOLUNTEER", role: "VOLUNTEER", memberSince: "2015", attendanceCount: 32, isActive: true },
      { id: "mem_0008", memberId: "VYA-008", name: "M. Rajesh Verma", fullName: "Madugula Rajesh Verma", fatherName: "M. Laxmi Narayana", phone: "8978563412", gotram: "Bharadwaja", email: "rajeshv@ganeshbns.org", bloodGroup: "A+", address: "H.No. 3-4-12, Temple Street, Banswada", membershipType: "ANNUAL", membershipFee: 3000, feeStatus: "PAID", committeeRole: "VOLUNTEER", role: "VOLUNTEER", memberSince: "2018", attendanceCount: 28, isActive: true },
      { id: "mem_0009", memberId: "VYA-009", name: "K. Srinivas Goud", fullName: "Kummari Srinivas Goud", fatherName: "K. Laxman Goud", phone: "9849087654", gotram: "Shiva Gotram", email: "srinivasg@ganeshbns.org", bloodGroup: "B+", address: "H.No. 7-8-56, Gudem Gally, Banswada", membershipType: "ANNUAL", membershipFee: 5000, feeStatus: "PAID", committeeRole: "COMMITTEE_MEMBER", role: "COMMITTEE_MEMBER", memberSince: "2012", attendanceCount: 35, isActive: true },
      { id: "mem_0010", memberId: "VYA-010", name: "P. Raju", fullName: "Pothuganti Raju", fatherName: "P. Venkat Ramana", phone: "9440567890", gotram: "Shiva Gotram", email: "raju@ganeshbns.org", bloodGroup: "O+", address: "H.No. 5-6-89, Station Road, Banswada", membershipType: "ANNUAL", membershipFee: 3000, feeStatus: "PAID", committeeRole: "VOLUNTEER", role: "VOLUNTEER", memberSince: "2020", attendanceCount: 22, isActive: true },
      { id: "mem_0011", memberId: "VYA-011", name: "T. Venkat Ramana", fullName: "Thadakamalla Venkat Ramana", fatherName: "T. Rama Rao", phone: "9848022222", gotram: "Kashyapa", email: "venkat@ganeshbns.org", bloodGroup: "A-", address: "H.No. 8-9-12, College Road, Banswada", membershipType: "LIFETIME", membershipFee: 10000, feeStatus: "PAID", committeeRole: "MEMBER", role: "MEMBER", memberSince: "2005", attendanceCount: 40, isActive: true },
      { id: "mem_0012", memberId: "VYA-012", name: "Sanjeev Kumar", fullName: "Komatla Sanjeev Kumar", fatherName: "K. Sathaiah", phone: "9490345678", gotram: "Vasishtha", email: "sanjeev@ganeshbns.org", bloodGroup: "B+", address: "H.No. 9-10-34, Bus Stand Area, Banswada", membershipType: "ANNUAL", membershipFee: 3000, feeStatus: "PAID", committeeRole: "VOLUNTEER", role: "VOLUNTEER", memberSince: "2019", attendanceCount: 25, isActive: true },
      { id: "mem_0013", memberId: "VYA-013", name: "Vikram Reddy", fullName: "Mukkala Vikram Reddy", fatherName: "M. Narsimha Reddy", phone: "8978901234", gotram: "Bharadwaja", email: "vikram@ganeshbns.org", bloodGroup: "O+", address: "H.No. 10-11-67, Gudem Gally, Banswada", membershipType: "ANNUAL", membershipFee: 3000, feeStatus: "PAID", committeeRole: "VOLUNTEER", role: "VOLUNTEER", memberSince: "2021", attendanceCount: 18, isActive: true },
      { id: "mem_0014", memberId: "VYA-014", name: "Manoj Goud", fullName: "Neellati Manoj Goud", fatherName: "N. Srinivas Goud", phone: "9490789012", gotram: "Kashyapa", email: "manoj@ganeshbns.org", bloodGroup: "AB+", address: "H.No. 11-12-89, Temple Street, Banswada", membershipType: "ANNUAL", membershipFee: 3000, feeStatus: "PAID", committeeRole: "VOLUNTEER", role: "VOLUNTEER", memberSince: "2022", attendanceCount: 15, isActive: true },
      { id: "mem_0015", memberId: "VYA-015", name: "Ch. Sai Krishna", fullName: "Chitkula Sai Krishna", fatherName: "Ch. Srinivas", phone: "9848055555", gotram: "Vasishtha", email: "saikrishna@ganeshbns.org", bloodGroup: "A+", address: "H.No. 4-5-34, Market Area, Banswada", membershipType: "ANNUAL", membershipFee: 2000, feeStatus: "PENDING", committeeRole: "MEMBER", role: "MEMBER", memberSince: "2023", attendanceCount: 10, isActive: true },
    ];

    for (const member of membersData) {
      await db.insert(schema.members).values(member).onConflictDoNothing();
    }

    // ============================================
    // 4. ROLES AUDIT
    // ============================================
    console.log("\n📝 Seeding roles_audit...");
    const rolesAuditData = [
      { id: "ra_0001", memberId: "VYA-001", oldRole: "MEMBER", newRole: "SUPER_ADMIN", changedBy: "SYSTEM", reason: "Initial Setup - System Administrator" },
      { id: "ra_0002", memberId: "VYA-002", oldRole: "MEMBER", newRole: "PRESIDENT", changedBy: "SYSTEM", reason: "Initial Setup - Association President" },
      { id: "ra_0003", memberId: "VYA-003", oldRole: "MEMBER", newRole: "TREASURER", changedBy: "SYSTEM", reason: "Initial Setup - Finance Management" },
      { id: "ra_0004", memberId: "VYA-004", oldRole: "MEMBER", newRole: "SECRETARY", changedBy: "SYSTEM", reason: "Initial Setup - Administration" },
      { id: "ra_0005", memberId: "VYA-005", oldRole: "VOLUNTEER", newRole: "EVENT_INCHARGE", changedBy: "VYA-001", reason: "Promoted for excellent service" },
    ];

    for (const audit of rolesAuditData) {
      await db.insert(schema.rolesAudit).values(audit).onConflictDoNothing();
    }

    // ============================================
    // 5. DONATIONS
    // ============================================
    console.log("\n💰 Seeding donations...");
    const donationsData = [
      { id: "don_0001", receiptNo: "VYA-2026-0001", donorName: "Sri K. Rajeshwar Rao & Family", phone: "9848011111", gotram: "Shiva Gotram", amount: 100000, paymentMode: "UPI", transactionId: "UPI8492019", purpose: "Golden Jubilee Maha Sponsor", sponsorTierId: "st_0001", sponsorCategory: "Maha Raja Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "K. Srinivas Goud", date: "2026-08-15" },
      { id: "don_0002", receiptNo: "VYA-2026-0002", donorName: "T. Venkat Ramana & Brothers", phone: "9848022222", gotram: "Kashyapa", amount: 50000, paymentMode: "CASH", purpose: "Annadanam Sponsorship", sponsorTierId: "st_0002", sponsorCategory: "Diamond Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "V. Santosh Kumar", date: "2026-08-18" },
      { id: "don_0003", receiptNo: "VYA-2026-0003", donorName: "M. Laxmi Narayana", phone: "9848033333", gotram: "Bharadwaja", amount: 25000, paymentMode: "UPI", transactionId: "UPI9023412", purpose: "Laddu Prasadam Seva", sponsorTierId: "st_0003", sponsorCategory: "Gold Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "M. Rajesh Verma", date: "2026-08-20" },
      { id: "don_0004", receiptNo: "VYA-2026-0004", donorName: "Gudem Gally Youth Group", phone: "9848044444", gotram: "Shiva Gotram", amount: 15000, paymentMode: "UPI", transactionId: "UPI1238947", purpose: "Lighting & Decoration", sponsorTierId: "st_0004", sponsorCategory: "Silver Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "A. Suresh Reddy", date: "2026-08-22" },
      { id: "don_0005", receiptNo: "VYA-2026-0005", donorName: "Ch. Sai Krishna", phone: "9848055555", gotram: "Vasishtha", amount: 5116, paymentMode: "UPI", transactionId: "UPI7782910", purpose: "Daily Pooja Seva", sponsorTierId: "st_0006", sponsorCategory: "General Donor", taxExempt80G: true, status: "SUCCESS", collectedBy: "P. Raju", date: "2026-08-24" },
      { id: "don_0006", receiptNo: "VYA-2026-0006", donorName: "Sri Sai Jewellers", phone: "9848066666", gotram: "Kashyapa", amount: 100000, paymentMode: "BANK_TRANSFER", transactionId: "NEFT2026082501", purpose: "Golden Jubilee Maha Sponsor", sponsorTierId: "st_0001", sponsorCategory: "Maha Raja Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "Online Transfer", date: "2026-08-25" },
      { id: "don_0007", receiptNo: "VYA-2026-0007", donorName: "Anuradha Devi & Family", phone: "9848077777", gotram: "Bharadwaja", amount: 25000, paymentMode: "UPI", transactionId: "UPI4455667", purpose: "Annadanam Sponsorship", sponsorTierId: "st_0003", sponsorCategory: "Gold Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "K. Srinivas Goud", date: "2026-08-25" },
      { id: "don_0008", receiptNo: "VYA-2026-0008", donorName: "Dr. Ramesh Clinic", phone: "9848088888", gotram: "Shiva Gotram", amount: 10000, paymentMode: "CASH", purpose: "Medical Camp Seva", sponsorTierId: "st_0004", sponsorCategory: "Silver Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "V. Santosh Kumar", date: "2026-08-26" },
      { id: "don_0009", receiptNo: "VYA-2026-0009", donorName: "Rajeshwari Devi", phone: "9848099999", gotram: "Vasishtha", amount: 5000, paymentMode: "UPI", transactionId: "UPI8899001", purpose: "Daily Pooja Seva", sponsorTierId: "st_0005", sponsorCategory: "Bronze Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "M. Rajesh Verma", date: "2026-08-26" },
      { id: "don_0010", receiptNo: "VYA-2026-0010", donorName: "Sharma Family Trust", phone: "9848000001", gotram: "Kashyapa", amount: 50000, paymentMode: "BANK_TRANSFER", transactionId: "NEFT2026082601", purpose: "Idol Adornment", sponsorTierId: "st_0002", sponsorCategory: "Diamond Patron", taxExempt80G: true, status: "SUCCESS", collectedBy: "Online Transfer", date: "2026-08-26" },
    ];

    for (const donation of donationsData) {
      await db.insert(schema.donations).values(donation).onConflictDoNothing();
    }

    // ============================================
    // 6. TRANSACTIONS (Cash Book)
    // ============================================
    console.log("\n📒 Seeding transactions...");
    const transactionsData = [
      // Income entries
      { id: "txn_0001", voucherNo: "V-VYA-2026-001", type: "INCOME", category: "DONATION", categoryId: "ec_0001", amount: 100000, mode: "UPI", relatedDonationId: "don_0001", title: "Maha Raja Patron Donation", notes: "Golden Jubilee Maha Sponsor - K. Rajeshwar Rao", recordedBy: "VYA-001", date: "2026-08-15", status: "APPROVED" },
      { id: "txn_0002", voucherNo: "V-VYA-2026-002", type: "INCOME", category: "DONATION", categoryId: "ec_0005", amount: 50000, mode: "CASH", relatedDonationId: "don_0002", title: "Annadanam Sponsorship", notes: "Diamond Patron - T. Venkat Ramana", recordedBy: "VYA-001", date: "2026-08-18", status: "APPROVED" },
      { id: "txn_0003", voucherNo: "V-VYA-2026-003", type: "INCOME", category: "DONATION", categoryId: "ec_0004", amount: 25000, mode: "UPI", relatedDonationId: "don_0003", title: "Laddu Prasadam Seva", notes: "Gold Patron - M. Laxmi Narayana", recordedBy: "VYA-001", date: "2026-08-20", status: "APPROVED" },
      { id: "txn_0004", voucherNo: "V-VYA-2026-004", type: "INCOME", category: "DONATION", categoryId: "ec_0003", amount: 15000, mode: "UPI", relatedDonationId: "don_0004", title: "Lighting & Decoration Seva", notes: "Silver Patron - Youth Group", recordedBy: "VYA-001", date: "2026-08-22", status: "APPROVED" },
      // Expense entries
      { id: "txn_0005", voucherNo: "V-VYA-2026-005", type: "EXPENSE", category: "Mandapam & Stage", categoryId: "ec_0001", amount: 45000, mode: "BANK_TRANSFER", title: "Grand Mandapam & Wooden Stage Setup", paidTo: "Balaji Tent House, Banswada", vendorName: "Balaji Tent House", notes: "50x40 feet grand mandapam with wooden flooring", approvedBy: "VYA-001", recordedBy: "VYA-003", date: "2026-08-12", status: "APPROVED" },
      { id: "txn_0006", voucherNo: "V-VYA-2026-006", type: "EXPENSE", category: "Idol & Decoration", categoryId: "ec_0002", amount: 35000, mode: "UPI", title: "50-Feet Ganesh Idol Advance Adornment", paidTo: "Siri Ganesh Arts Dhoolpet", vendorName: "Siri Ganesh Arts", notes: "50th year special idol with golden finish", approvedBy: "VYA-002", recordedBy: "VYA-003", date: "2026-08-14", status: "APPROVED" },
      { id: "txn_0007", voucherNo: "V-VYA-2026-007", type: "EXPENSE", category: "Sound & Lights", categoryId: "ec_0003", amount: 20000, mode: "UPI", title: "DJ & 3D LED Lighting System Advance", paidTo: "Rockstar Sounds, Nizamabad", vendorName: "Rockstar Sounds", notes: "3D LED mapping and DJ setup for 11 days", approvedBy: "VYA-004", recordedBy: "VYA-003", date: "2026-08-17", status: "APPROVED" },
      { id: "txn_0008", voucherNo: "V-VYA-2026-008", type: "EXPENSE", category: "Pooja Samagri", categoryId: "ec_0004", amount: 8500, mode: "CASH", title: "Pooja Samagri, Dhoop & Fruits", paidTo: "Siri Rama Pooja Stores", vendorName: "Siri Rama Pooja Stores", notes: "Daily pooja items for 11 days", approvedBy: "VYA-005", recordedBy: "VYA-003", date: "2026-08-20", status: "APPROVED" },
      { id: "txn_0009", voucherNo: "V-VYA-2026-009", type: "EXPENSE", category: "Annadanam", categoryId: "ec_0005", amount: 75000, mode: "BANK_TRANSFER", title: "Annadanam Raw Materials Advance", paidTo: "Sri Venkateswara Rice Mill", vendorName: "Sri Venkateswara Rice Mill", notes: "Rice, dal, vegetables for 10,000+ devotees", approvedBy: "VYA-002", recordedBy: "VYA-003", date: "2026-08-23", status: "APPROVED" },
      { id: "txn_0010", voucherNo: "V-VYA-2026-010", type: "EXPENSE", category: "Security & Permissions", categoryId: "ec_0007", amount: 5000, mode: "CASH", title: "Police Permission & Security Deposit", paidTo: "Banswada Police Station", notes: "Permission for procession and gathering", approvedBy: "VYA-001", recordedBy: "VYA-004", date: "2026-08-25", status: "APPROVED" },
    ];

    for (const txn of transactionsData) {
      await db.insert(schema.transactions).values(txn).onConflictDoNothing();
    }

    // ============================================
    // 7. EXPENSE APPROVALS
    // ============================================
    console.log("\n✅ Seeding expense_approvals...");
    const expenseApprovalsData = [
      { id: "exp_0001", transactionId: "txn_0005", requestedBy: "VYA-003", approvedBy: "VYA-001", status: "APPROVED", notes: "Approved for Golden Jubilee grand setup", amount: 45000 },
      { id: "exp_0002", transactionId: "txn_0006", requestedBy: "VYA-003", approvedBy: "VYA-002", status: "APPROVED", notes: "Special 50th year idol approved", amount: 35000 },
      { id: "exp_0003", transactionId: "txn_0007", requestedBy: "VYA-003", approvedBy: "VYA-004", status: "APPROVED", notes: "Sound system for 11 days approved", amount: 20000 },
      { id: "exp_0004", transactionId: "txn_0008", requestedBy: "VYA-003", approvedBy: "VYA-005", status: "APPROVED", notes: "Daily pooja items approved", amount: 8500 },
      { id: "exp_0005", transactionId: "txn_0009", requestedBy: "VYA-003", approvedBy: "VYA-002", status: "APPROVED", notes: "Annadanam materials advance approved", amount: 75000 },
      { id: "exp_0006", transactionId: "txn_0010", requestedBy: "VYA-004", approvedBy: "VYA-001", status: "APPROVED", notes: "Police permission approved", amount: 5000 },
      // Pending approval
      { id: "exp_0007", transactionId: "txn_0011", requestedBy: "VYA-005", status: "PENDING", notes: "Additional decoration items for visarjan", amount: 15000 },
    ];

    for (const approval of expenseApprovalsData) {
      await db.insert(schema.expenseApprovals).values(approval).onConflictDoNothing();
    }

    // ============================================
    // 8. EVENTS
    // ============================================
    console.log("\n📅 Seeding events...");
    const eventsData = [
      { id: "evt_0001", day: 1, title: "Ganapathi Prathisthapana & Maha Homam", titleTe: "గణపతి ప్రతిష్ఠాపన & మహా హోమం", type: "POOJA", categoryId: "evc_0001", description: "Grand prathisthapana ceremony with Vedic pandits, followed by Ganapathi Homam. 50th year special Golden Kalash Sthapana.", descriptionTe: "వేద పండితులతో గొప్ప ప్రతిష్ఠాపన వేడుక, తర్వాత గణపతి హోమం.", date: "2026-08-27", timing: "08:30 AM - 01:00 PM", startTime: "08:30 AM", endTime: "01:00 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-009", isPublished: true, sortOrder: 1 },
      { id: "evt_0002", day: 2, title: "Sri Sukta Homam & Kumkumarchana", titleTe: "శ్రీ సూక్త హోమం & కుంకుమార్చన", type: "POOJA", categoryId: "evc_0001", description: "Special Kumkumarchana for women devotees and Sri Sukta Homam for prosperity.", descriptionTe: "మహిళా భక్తులకు ప్రత్యేక కుంకుమార్చన మరియు శ్రీ సూక్త హోమం.", date: "2026-08-28", timing: "09:00 AM - 12:30 PM", startTime: "09:00 AM", endTime: "12:30 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-008", isPublished: true, sortOrder: 2 },
      { id: "evt_0003", day: 3, title: "Sahasranama Archana & Bhajan", titleTe: "సహస్రనామ అర్చన & భజన", type: "POOJA", categoryId: "evc_0001", description: "1008 Ganesha Namas chanting followed by Devotional Bhajans by renowned artists.", descriptionTe: "1008 గణేశ నామాల పఠనం తర్వాత ప్రసిద్ధ కళాకారులచే భక్తి భజనలు.", date: "2026-08-29", timing: "06:30 PM - 10:00 PM", startTime: "06:30 PM", endTime: "10:00 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-007", isPublished: true, sortOrder: 3 },
      { id: "evt_0004", day: 4, title: "Maha Aarti & Cultural Evening", titleTe: "మహా ఆరతి & సాంస్కృతిక సాయంత్రం", type: "AARTI", categoryId: "evc_0004", description: "Grand evening aarti followed by cultural programs - classical dance, music, and drama.", descriptionTe: "గొప్ప సాయంత్రం ఆరతి తర్వాత సాంస్కృతిక కార్యక్రమాలు.", date: "2026-08-30", timing: "05:00 PM - 10:30 PM", startTime: "05:00 PM", endTime: "10:30 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-005", isPublished: true, sortOrder: 4 },
      { id: "evt_0005", day: 5, title: "Maha Annadanam (10,000+ Devotees)", titleTe: "మహా అన్నదానం (10,000+ భక్తులు)", type: "ANNADANAM", categoryId: "evc_0003", description: "Grand feast annadanam seva for all devotees across Banswada. Special menu with 12 varieties.", descriptionTe: "బాన్స్‌వాడ అంతటా అన్ని భక్తులకు గొప్ప అన్నదాన సేవ. 12 రకాల మెనూ.", date: "2026-08-31", timing: "12:00 PM - 05:00 PM", startTime: "12:00 PM", endTime: "05:00 PM", location: "Community Dining Hall", inCharge: "VYA-006", isPublished: true, sortOrder: 5 },
      { id: "evt_0006", day: 6, title: "Laddu Auction & Entertainment", titleTe: "లడ్డు వేలం & వినోదం", type: "AUCTION", categoryId: "evc_0004", description: "Sacred Laddu Prasadam auction followed by entertainment programs and DJ night.", descriptionTe: "పవిత్ర లడ్డు ప్రసాదం వేలం తర్వాత వినోద కార్యక్రమాలు.", date: "2026-09-01", timing: "06:00 PM - 11:00 PM", startTime: "06:00 PM", endTime: "11:00 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-009", isPublished: true, sortOrder: 6 },
      { id: "evt_0007", day: 7, title: "Special Abhishekam & Alankaram", titleTe: "ప్రత్యేక అభిషేకం & అలంకారం", type: "POOJA", categoryId: "evc_0001", description: "Special abhishekam with panchamritam and grand alankaram with fresh flowers.", descriptionTe: "పంచామృతంతో ప్రత్యేక అభిషేకం మరియు తాజా పూలతో గొప్ప అలంకారం.", date: "2026-09-02", timing: "09:00 AM - 12:00 PM", startTime: "09:00 AM", endTime: "12:00 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-008", isPublished: true, sortOrder: 7 },
      { id: "evt_0008", day: 8, title: "Youth Day & Sports Events", titleTe: "యువజన దినోత్సవం & క్రీడా కార్యక్రమాలు", type: "CULTURAL", categoryId: "evc_0004", description: "Sports competitions, games, and special programs organized by youth volunteers.", descriptionTe: "యువ స్వచ్ఛంద సేవకులు నిర్వహించే క్రీడా పోటీలు మరియు కార్యక్రమాలు.", date: "2026-09-03", timing: "08:00 AM - 06:00 PM", startTime: "08:00 AM", endTime: "06:00 PM", location: "Banswada Grounds", inCharge: "VYA-007", isPublished: true, sortOrder: 8 },
      { id: "evt_0009", day: 9, title: "Maha Palaki Seva & Procession", titleTe: "మహా పల్లకీ సేవ & ఊరేగింపు", type: "PROCESSION", categoryId: "evc_0005", description: "Grand palanquin procession through main streets of Banswada with band and devotees.", descriptionTe: "బ్యాండ్ మరియు భక్తులతో బాన్స్‌వాడ ప్రధాన వీధులలో గొప్ప పల్లకీ ఊరేగింపు.", date: "2026-09-04", timing: "05:00 PM - 09:00 PM", startTime: "05:00 PM", endTime: "09:00 PM", location: "Banswada Main Streets", inCharge: "VYA-005", isPublished: true, sortOrder: 9 },
      { id: "evt_0010", day: 10, title: "Final Day Pooja & Distribution", titleTe: "చివరి రోజు పూజ & పంపిణీ", type: "POOJA", categoryId: "evc_0001", description: "Final day special pooja, distribution of prasadam, and preparation for visarjan.", descriptionTe: "చివరి రోజు ప్రత్యేక పూజ, ప్రసాదం పంపిణీ, విసర్జన సన్నద్ధత.", date: "2026-09-05", timing: "08:00 AM - 06:00 PM", startTime: "08:00 AM", endTime: "06:00 PM", location: "Gudem Gally Mandapam", inCharge: "VYA-006", isPublished: true, sortOrder: 10 },
      { id: "evt_0011", day: 11, title: "Grand Visarjan Shobhayatra", titleTe: "గ్రాండ్ విసర్జన శోభాయాత్ర", type: "VISARJAN", categoryId: "evc_0006", description: "50th Golden Jubilee Grand Immersion Procession with DJ, Nashik Dhol, Fireworks & 10,000+ devotees.", descriptionTe: "50వ స్వర్ణోత్సవ గ్రాండ్ విసర్జన ఊరేగింపు - DJ, నాసిక్ ఢోల్, టపాసులు & 10,000+ భక్తులు.", date: "2026-09-06", timing: "02:00 PM - Late Night", startTime: "02:00 PM", endTime: "11:59 PM", location: "Route: Mandapam → Main Bazar → Bus Stand → Tank Bund", inCharge: "VYA-009", isPublished: true, sortOrder: 11 },
    ];

    for (const event of eventsData) {
      await db.insert(schema.events).values(event).onConflictDoNothing();
    }

    // ============================================
    // 9. VOLUNTEER DUTIES
    // ============================================
    console.log("\n🤝 Seeding volunteer_duties...");
    const volunteerDutiesData = [
      { id: "vol_0001", eventId: "evt_0001", volunteerId: "mem_0010", volunteerName: "P. Raju", role: "Morning Aarti & Prasadam", task: "Arrange pooja items and distribute prasadam", shift: "Morning", shiftStart: "07:00 AM", shiftEnd: "11:00 AM", location: "Mandapam Inside", status: "ASSIGNED" },
      { id: "vol_0002", eventId: "evt_0005", volunteerId: "mem_0012", volunteerName: "Sanjeev Kumar", role: "Annadanam Food Counter", task: "Serve food and manage dining area", shift: "Afternoon", shiftStart: "11:30 AM", shiftEnd: "04:00 PM", location: "Dining Hall", status: "ASSIGNED" },
      { id: "vol_0003", eventId: "evt_0011", volunteerId: "mem_0013", volunteerName: "Vikram Reddy", role: "Traffic & Queue Control", task: "Manage crowd and traffic during procession", shift: "Evening", shiftStart: "05:30 PM", shiftEnd: "10:30 PM", location: "Gudem Gally Entrance", status: "ASSIGNED" },
      { id: "vol_0004", eventId: "evt_0001", volunteerId: "mem_0014", volunteerName: "Manoj Goud", role: "Night Security & Lighting", task: "Security patrol and lighting management", shift: "Night", shiftStart: "11:00 PM", shiftEnd: "06:00 AM", location: "Mandapam Premises", status: "ASSIGNED" },
      { id: "vol_0005", eventId: "evt_0005", volunteerId: "mem_0007", volunteerName: "V. Santosh Kumar", role: "Kitchen Coordinator", task: "Coordinate kitchen operations and food preparation", shift: "Morning", shiftStart: "06:00 AM", shiftEnd: "02:00 PM", location: "Kitchen Area", status: "ASSIGNED" },
      { id: "vol_0006", eventId: "evt_0006", volunteerId: "mem_0008", volunteerName: "M. Rajesh Verma", role: "Auction Assistant", task: "Manage auction registration and bidding process", shift: "Evening", shiftStart: "05:00 PM", shiftEnd: "11:00 PM", location: "Main Stage", status: "ASSIGNED" },
      { id: "vol_0007", eventId: "evt_0011", volunteerId: "mem_0006", volunteerName: "A. Suresh Reddy", role: "Procession Coordinator", task: "Lead the visarjan procession route management", shift: "Full Day", shiftStart: "12:00 PM", shiftEnd: "11:59 PM", location: "Procession Route", status: "ASSIGNED" },
      { id: "vol_0008", eventId: "evt_0004", volunteerId: "mem_0010", volunteerName: "P. Raju", role: "Stage Setup", task: "Setup stage for cultural programs", shift: "Afternoon", shiftStart: "02:00 PM", shiftEnd: "05:00 PM", location: "Main Stage", status: "ASSIGNED" },
    ];

    for (const duty of volunteerDutiesData) {
      await db.insert(schema.volunteerDuties).values(duty).onConflictDoNothing();
    }

    // ============================================
    // 10. ATTENDANCE
    // ============================================
    console.log("\n✋ Seeding attendance...");
    const attendanceData = [
      { id: "att_0001", memberId: "VYA-001", eventId: "evt_0001", method: "QR", markedBy: "SYSTEM" },
      { id: "att_0002", memberId: "VYA-002", eventId: "evt_0001", method: "MANUAL", markedBy: "VYA-001" },
      { id: "att_0003", memberId: "VYA-003", eventId: "evt_0001", method: "QR", markedBy: "SYSTEM" },
      { id: "att_0004", memberId: "VYA-004", eventId: "evt_0001", method: "MANUAL", markedBy: "VYA-001" },
      { id: "att_0005", memberId: "VYA-005", eventId: "evt_0001", method: "QR", markedBy: "SYSTEM" },
    ];

    for (const att of attendanceData) {
      await db.insert(schema.attendance).values(att).onConflictDoNothing();
    }

    // ============================================
    // 11. INVENTORY ITEMS
    // ============================================
    console.log("\n📦 Seeding inventory_items...");
    const inventoryData = [
      { id: "inv_0001", name: "Silver Chhatra (Crown & Umbrella)", description: "Sacred silver umbrella and crown for the deity", category: "Precious Ornaments", categoryId: "ec_0002", quantity: 1, available: 1, issued: 0, total: 1, unit: "set", condition: "Excellent", location: "Inner Sanctum Safe", inCharge: "VYA-007", purchaseCost: 150000, lowStockThreshold: 1 },
      { id: "inv_0002", name: "Brass Harathi Diyas (5-Tier)", description: "Traditional 5-tier brass lamps for aarti", category: "Pooja Vessels", categoryId: "ec_0004", quantity: 4, available: 4, issued: 0, total: 4, unit: "pieces", condition: "Good", location: "Store Room", inCharge: "VYA-006", purchaseCost: 8000, lowStockThreshold: 2 },
      { id: "inv_0003", name: "Laddu Prasadam Boxes (500g)", description: "Premium laddu boxes for distribution", category: "Prasadam Packaging", categoryId: "ec_0004", quantity: 2500, available: 2500, issued: 0, total: 2500, unit: "boxes", condition: "New", location: "Storage Area", inCharge: "VYA-010", purchaseCost: 12500, lowStockThreshold: 100 },
      { id: "inv_0004", name: "VYA Golden Jubilee Saffron Flags", description: "Special flags for Golden Jubilee celebration", category: "Decoration", categoryId: "ec_0002", quantity: 1000, available: 1000, issued: 0, total: 1000, unit: "flags", condition: "New", location: "Decoration Store", inCharge: "VYA-008", purchaseCost: 25000, lowStockThreshold: 50 },
      { id: "inv_0005", name: "Wooden Tables (6ft)", description: "Sturdy wooden tables for various purposes", category: "Furniture", quantity: 25, available: 25, issued: 0, total: 25, unit: "pieces", condition: "Good", location: "Store Room", inCharge: "VYA-005", purchaseCost: 75000, lowStockThreshold: 5 },
      { id: "inv_0006", name: "Steel Plates (Thali)", description: "Steel plates for annadanam service", category: "Kitchen Items", categoryId: "ec_0005", quantity: 500, available: 500, issued: 0, total: 500, unit: "pieces", condition: "Good", location: "Kitchen Storage", inCharge: "VYA-007", purchaseCost: 25000, lowStockThreshold: 50 },
      { id: "inv_0007", name: "Sound System (Complete Set)", description: "DJ sound system with speakers and mixer", category: "Sound Equipment", categoryId: "ec_0003", quantity: 1, available: 1, issued: 0, total: 1, unit: "set", condition: "Good", location: "Sound Room", inCharge: "VYA-009", isRented: true, rentalVendor: "Rockstar Sounds", rentalVendorId: "vendor_001", rentalCost: 50000, lowStockThreshold: 1 },
      { id: "inv_0008", name: "LED Lights (100m Roll)", description: "LED strip lights for decoration", category: "Lighting", categoryId: "ec_0003", quantity: 10, available: 10, issued: 0, total: 10, unit: "rolls", condition: "New", location: "Lighting Store", inCharge: "VYA-008", purchaseCost: 15000, lowStockThreshold: 2 },
    ];

    for (const item of inventoryData) {
      await db.insert(schema.inventoryItems).values(item).onConflictDoNothing();
    }

    // ============================================
    // 12. DOCUMENTS
    // ============================================
    console.log("\n📄 Seeding documents...");
    const documentsData = [
      { id: "doc_0001", title: "Police Permission Letter 2026", type: "OFFICIAL", description: "Official permission from Banswada Police for Ganesh Utsav 2026", fileUrl: "https://files.ganeshbns.org/docs/police-permission-2026.pdf", expiryDate: "2026-09-15", isPublished: true, sortOrder: 1, uploadedBy: "VYA-004" },
      { id: "doc_0002", title: "Association Registration Certificate", type: "LEGAL", description: "TS Society Registration Certificate", fileUrl: "https://files.ganeshbns.org/docs/registration-certificate.pdf", isPublished: true, sortOrder: 2, uploadedBy: "VYA-001" },
      { id: "doc_0003", title: "80G Tax Exemption Certificate", type: "TAX", description: "Income Tax 80G exemption certificate for donations", fileUrl: "https://files.ganeshbns.org/docs/80g-certificate.pdf", expiryDate: "2027-03-31", isPublished: true, sortOrder: 3, uploadedBy: "VYA-003" },
      { id: "doc_0004", title: "Fire Safety NOC", type: "OFFICIAL", description: "Fire department no-objection certificate", fileUrl: "https://files.ganeshbns.org/docs/fire-noc-2026.pdf", expiryDate: "2026-09-30", isPublished: true, sortOrder: 4, uploadedBy: "VYA-004" },
      { id: "doc_0005", title: "Event Insurance Policy", type: "LEGAL", description: "Event liability insurance for Ganesh Utsav", fileUrl: "https://files.ganeshbns.org/docs/insurance-2026.pdf", expiryDate: "2026-09-30", isPublished: false, sortOrder: 5, uploadedBy: "VYA-003" },
    ];

    for (const doc of documentsData) {
      await db.insert(schema.documents).values(doc).onConflictDoNothing();
    }

    // ============================================
    // 13. NOTICES
    // ============================================
    console.log("\n📢 Seeding notices...");
    const noticesData = [
      { id: "not_0001", title: "Utsav Planning Meeting - All Members", body: "All committee members are requested to attend the planning meeting on Sunday at 10:00 AM at the Mandapam. Agenda: Final preparations for Golden Jubilee celebrations.", channel: "ALL", channels: ["TELEGRAM", "WHATSAPP"], audience: "COMMITTEE", status: "PUBLISHED", isPinned: true, sentBy: "VYA-001" },
      { id: "not_0002", title: "Volunteer Duty Roster Published", body: "The volunteer duty roster for 11 days has been published. Please check your assigned shifts and report to your in-charge 30 minutes before your shift.", channel: "TELEGRAM", audience: "VOLUNTEERS", status: "PUBLISHED", isPinned: false, sentBy: "VYA-005" },
      { id: "not_0003", title: "Annadanam Sponsorship Appeal", body: "We invite devotees to sponsor Annadanam Seva for any day during the 11-day festival. Please contact the treasurer for details.", channel: "WHATSAPP", audience: "ALL", status: "PUBLISHED", isPinned: false, sentBy: "VYA-003" },
      { id: "not_0004", title: "Visarjan Route Change Notice", body: "Due to road construction, the visarjan procession route has been modified. Updated route map will be shared soon.", channel: "TELEGRAM", audience: "ALL", status: "DRAFT", isPinned: false, sentBy: "VYA-004" },
      { id: "not_0005", title: "Emergency Contact Numbers", body: "For any emergencies during the festival:\nPresident: 9440112345\nSecretary: 9989098765\nTreasurer: 9849054321\nEmergency: 112", channel: "ALL", channels: ["TELEGRAM", "WHATSAPP"], audience: "ALL", status: "PUBLISHED", isPinned: true, sentBy: "VYA-001" },
    ];

    for (const notice of noticesData) {
      await db.insert(schema.notices).values(notice).onConflictDoNothing();
    }

    // ============================================
    // 14. SPONSORS
    // ============================================
    console.log("\n🏆 Seeding sponsors...");
    const sponsorsData = [
      { id: "spo_0001", name: "Sri K. Rajeshwar Rao & Family", tier: "Maha Raja Patron", tierId: "st_0001", amount: 100000, donationId: "don_0001", contactPhone: "9848011111", contactPerson: "K. Rajeshwar Rao", year: 2026, isPublished: true, displayOrder: 1 },
      { id: "spo_0002", name: "Sri Sai Jewellers", tier: "Maha Raja Patron", tierId: "st_0001", amount: 100000, donationId: "don_0006", contactPhone: "9848066666", contactPerson: "Sai Krishna", logoUrl: "https://files.ganeshbns.org/sponsors/sri-sai-jewellers.png", year: 2026, isPublished: true, displayOrder: 2 },
      { id: "spo_0003", name: "T. Venkat Ramana & Brothers", tier: "Diamond Patron", tierId: "st_0002", amount: 50000, donationId: "don_0002", contactPhone: "9848022222", contactPerson: "T. Venkat Ramana", year: 2026, isPublished: true, displayOrder: 3 },
      { id: "spo_0004", name: "Sharma Family Trust", tier: "Diamond Patron", tierId: "st_0002", amount: 50000, donationId: "don_0010", contactPhone: "9848000001", contactPerson: "R. Sharma", year: 2026, isPublished: true, displayOrder: 4 },
      { id: "spo_0005", name: "M. Laxmi Narayana", tier: "Gold Patron", tierId: "st_0003", amount: 25000, donationId: "don_0003", contactPhone: "9848033333", year: 2026, isPublished: true, displayOrder: 5 },
      { id: "spo_0006", name: "Anuradha Devi & Family", tier: "Gold Patron", tierId: "st_0003", amount: 25000, donationId: "don_0007", contactPhone: "9848077777", year: 2026, isPublished: true, displayOrder: 6 },
      { id: "spo_0007", name: "Gudem Gally Youth Team", tier: "Silver Patron", tierId: "st_0004", amount: 15000, donationId: "don_0004", contactPhone: "9848044444", year: 2026, isPublished: true, displayOrder: 7 },
      { id: "spo_0008", name: "Dr. Ramesh Clinic", tier: "Silver Patron", tierId: "st_0004", amount: 10000, donationId: "don_0008", contactPhone: "9848088888", year: 2026, isPublished: true, displayOrder: 8 },
    ];

    for (const sponsor of sponsorsData) {
      await db.insert(schema.sponsors).values(sponsor).onConflictDoNothing();
    }

    // ============================================
    // 15. GALLERY
    // ============================================
    console.log("\n🖼️ Seeding gallery...");
    const galleryData = [
      { id: "gal_0001", title: "Ganesh Chaturthi Maha Aarti 2025", titleTe: "గణేశ చతుర్థి మహా ఆరతి 2025", description: "Grand evening aarti during Ganesh Chaturthi celebrations", category: "Aarti", categoryId: "glc_0001", year: 2025, url: "https://images.unsplash.com/photo-1567794639-9e54e66dee44?w=800", thumbnailUrl: "https://images.unsplash.com/photo-1567794639-9e54e66dee44?w=400", isPublished: true, isFeatured: true, sortOrder: 1, uploadedBy: "VYA-001" },
      { id: "gal_0002", title: "Grand Visarjan Shobhayatra 2024", titleTe: "గ్రాండ్ విసర్జన శోభాయాత్ర 2024", description: "Thousands of devotees during the grand visarjan procession", category: "Visarjan", categoryId: "glc_0002", year: 2024, url: "https://images.unsplash.com/photo-1567794125-96cf7070c202?w=800", thumbnailUrl: "https://images.unsplash.com/photo-1567794125-96cf7070c202?w=400", isPublished: true, isFeatured: true, sortOrder: 2, uploadedBy: "VYA-004" },
      { id: "gal_0003", title: "Maha Laddu Auction Celebration 2023", titleTe: "మహా లడ్డు వేలం వేడుక 2023", description: "Exciting moments from the sacred laddu auction", category: "Auction", categoryId: "glc_0004", year: 2023, url: "https://images.unsplash.com/photo-1531966639870-d81dba7b7002?w=800", thumbnailUrl: "https://images.unsplash.com/photo-1531966639870-d81dba7b7002?w=400", isPublished: true, isFeatured: false, sortOrder: 3, uploadedBy: "VYA-003" },
      { id: "gal_0004", title: "Annadanam Maha Seva 2022", titleTe: "అన్నదానం మహా సేవ 2022", description: "Serving food to thousands of devotees during annadanam", category: "Annadanam", categoryId: "glc_0003", year: 2022, url: "https://images.unsplash.com/photo-1544816155-77574b747aa6?w=800", thumbnailUrl: "https://images.unsplash.com/photo-1544816155-77574b747aa6?w=400", isPublished: true, isFeatured: false, sortOrder: 4, uploadedBy: "VYA-005" },
      { id: "gal_0005", title: "Mandapam Decoration 2025", titleTe: "మండపం అలంకరణ 2025", description: "Beautiful mandapam setup with flowers and lights", category: "Mandapam", categoryId: "glc_0005", year: 2025, url: "https://images.unsplash.com/photo-1609766856923-7e0a0c06151d?w=800", thumbnailUrl: "https://images.unsplash.com/photo-1609766856923-7e0a0c06151d?w=400", isPublished: true, isFeatured: true, sortOrder: 5, uploadedBy: "VYA-006" },
      { id: "gal_0006", title: "Morning Procession 2024", titleTe: "ఉదయం ఊరేగింపు 2024", description: "Devotees carrying the deity during morning procession", category: "Procession", categoryId: "glc_0006", year: 2024, url: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800", thumbnailUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400", isPublished: true, isFeatured: false, sortOrder: 6, uploadedBy: "VYA-007" },
    ];

    for (const item of galleryData) {
      await db.insert(schema.gallery).values(item).onConflictDoNothing();
    }

    // ============================================
    // 16. AUCTION ITEMS
    // ============================================
    console.log("\n🔨 Seeding auction_items...");
    const auctionItemsData = [
      { id: "auc_0001", title: "50th Year Maha Laddu Prasadam (21 KG)", titleTe: "50వ సంవత్సరం మహా లడ్డు ప్రసాదం (21 కేజీలు)", description: "Sacred Laddu Prasadam offered to Banswada Ka Raja for 11 days. This special 21 KG laddu is blessed during the Golden Jubilee celebrations.", descriptionTe: "11 రోజుల పాటు బాన్స్‌వాడ కా రాజాకు సమర్పించిన పవిత్ర లడ్డు ప్రసాదం. ఈ ప్రత్యేక 21 కేజీల లడ్డు స్వర్ణోత్సవ వేడుకలలో ఆశీర్వదించబడింది.", basePrice: 50000, currentBid: 175000, reservePrice: 75000, highestBidderId: "mem_0011", highestBidderName: "K. Rajeshwar Rao", highestBidderPhone: "9848011111", status: "LIVE", isPublished: true, year: 2026, sortOrder: 1 },
      { id: "auc_0002", title: "Silver Zari Sacred Vastram", titleTe: "వెండి జరి పవిత్ర వస్త్రం", description: "Special blessed silk vastram (clothing) adorned by Lord Ganesha during the 11-day festival. Made with pure silver zari work.", descriptionTe: "11 రోజుల పండుగ సమయంలో శ్రీ గణేశుని అలంకరించిన ప్రత్యేక ఆశీర్వదించబడిన పట్టు వస్త్రం. స్వచ్ఛమైన వెండి జరి పనితో తయారు చేయబడింది.", basePrice: 10000, currentBid: 45000, reservePrice: 15000, highestBidderId: "mem_0011", highestBidderName: "T. Venkat Ramana", highestBidderPhone: "9848022222", status: "LIVE", isPublished: true, year: 2026, sortOrder: 2 },
      { id: "auc_0003", title: "Golden Kalash (Sacred Pot)", titleTe: "స్వర్ణ కలశం", description: "Golden kalash used during the prathisthapana ceremony. This sacred pot was part of the 50th year special rituals.", descriptionTe: "ప్రతిష్ఠాపన వేడుక సమయంలో ఉపయోగించిన బంగారు కలశం. ఈ పవిత్ర కుండ 50వ సంవత్సరం ప్రత్యేక ఆచారాలలో భాగం.", basePrice: 25000, currentBid: 0, status: "DRAFT", isPublished: false, year: 2026, sortOrder: 3 },
    ];

    for (const item of auctionItemsData) {
      await db.insert(schema.auctionItems).values(item).onConflictDoNothing();
    }

    // ============================================
    // 17. AUCTION BIDS
    // ============================================
    console.log("\n💰 Seeding auction_bids...");
    const auctionBidsData = [
      // Laddu auction bids
      { id: "bid_0001", auctionItemId: "auc_0001", bidderId: "mem_0011", bidderName: "K. Rajeshwar Rao", bidderPhone: "9848011111", amount: 60000, status: "OUTBID" },
      { id: "bid_0002", auctionItemId: "auc_0001", bidderId: "mem_0011", bidderName: "T. Venkat Ramana", bidderPhone: "9848022222", amount: 75000, status: "OUTBID" },
      { id: "bid_0003", auctionItemId: "auc_0001", bidderId: "mem_0011", bidderName: "M. Laxmi Narayana", bidderPhone: "9848033333", amount: 100000, status: "OUTBID" },
      { id: "bid_0004", auctionItemId: "auc_0001", bidderId: "mem_0011", bidderName: "Sharma Family Trust", bidderPhone: "9848000001", amount: 150000, status: "OUTBID" },
      { id: "bid_0005", auctionItemId: "auc_0001", bidderId: "mem_0011", bidderName: "K. Rajeshwar Rao", bidderPhone: "9848011111", amount: 175000, status: "WINNING" },
      // Vastram auction bids
      { id: "bid_0006", auctionItemId: "auc_0002", bidderId: "mem_0011", bidderName: "A. Suresh Reddy", bidderPhone: "9848012345", amount: 15000, status: "OUTBID" },
      { id: "bid_0007", auctionItemId: "auc_0002", bidderId: "mem_0011", bidderName: "V. Santosh Kumar", bidderPhone: "9490123456", amount: 25000, status: "OUTBID" },
      { id: "bid_0008", auctionItemId: "auc_0002", bidderId: "mem_0011", bidderName: "T. Venkat Ramana", bidderPhone: "9848022222", amount: 45000, status: "WINNING" },
    ];

    for (const bid of auctionBidsData) {
      await db.insert(schema.auctionBids).values(bid).onConflictDoNothing();
    }

    // ============================================
    // 18. AUDIT LOG
    // ============================================
    console.log("\n📝 Seeding audit_log...");
    const auditLogData = [
      { id: "aud_0001", actorMemberId: "SYSTEM", actorName: "System", action: "SEED", entity: "ALL", entityId: "SYS-001", newValue: { message: "Initial database seed completed" }, timestamp: new Date() },
      { id: "aud_0002", actorMemberId: "VYA-001", actorName: "K. Sandeep Raju", action: "CREATE", entity: "MEMBER", entityId: "VYA-015", newValue: { name: "Ch. Sai Krishna", memberId: "VYA-015" }, timestamp: new Date() },
      { id: "aud_0003", actorMemberId: "VYA-001", actorName: "K. Sandeep Raju", action: "UPDATE", entity: "SETTINGS", entityId: "settings", newValue: { heroTitleEn: "Banswada Ka Raja" }, timestamp: new Date() },
    ];

    for (const log of auditLogData) {
      await db.insert(schema.auditLog).values(log).onConflictDoNothing();
    }

    console.log("\n✅ Seeding complete! All tables populated with realistic data.");
    console.log("\n📊 Summary:");
    console.log("   - 1 association_settings row");
    console.log("   - 10 expense_categories");
    console.log("   - 6 sponsor_tiers");
    console.log("   - 6 event_categories");
    console.log("   - 6 gallery_categories");
    console.log("   - 8 donation_purposes");
    console.log("   - 15 members");
    console.log("   - 5 roles_audit entries");
    console.log("   - 10 donations");
    console.log("   - 10 transactions");
    console.log("   - 7 expense_approvals");
    console.log("   - 11 events");
    console.log("   - 8 volunteer_duties");
    console.log("   - 5 attendance records");
    console.log("   - 8 inventory_items");
    console.log("   - 5 documents");
    console.log("   - 5 notices");
    console.log("   - 8 sponsors");
    console.log("   - 6 gallery items");
    console.log("   - 3 auction_items");
    console.log("   - 8 auction_bids");
    console.log("   - 3 audit_log entries");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    throw err;
  } finally {
    process.exit(0);
  }
}

seed();

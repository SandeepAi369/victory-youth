"use client";

export type UserRole =
  | "SUPER_ADMIN"
  | "PRESIDENT"
  | "TREASURER"
  | "SECRETARY"
  | "EVENT_INCHARGE"
  | "COMMITTEE_MEMBER"
  | "VOLUNTEER"
  | "MEMBER"
  | "AUDITOR"
  | "GUEST";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole | string;
  avatarUrl?: string;
  memberId?: string;
  twoFactorEnabled?: boolean;
}

export interface Member {
  id: string;
  memberId: string;
  name: string;
  fullName?: string;
  fatherName?: string;
  phone?: string;
  mobile?: string;
  gotram?: string;
  email?: string;
  bloodGroup?: string;
  dob?: string;
  address?: string;
  role: string;
  status?: string;
  isActive?: boolean;
  membershipFee?: number;
  membershipFeeStatus?: string;
  lastPaymentDate?: string;
  joinedYear?: number;
  joinDate?: string;
  memberSince?: string;
  photoUrl?: string;
  avatarUrl?: string;
  qrCode?: string;
  familyMembers?: { name: string; relation: string; age?: number }[];
  attendanceCount?: number;
}

export type SponsorTier = "Maha Raja Patron" | "Diamond Patron" | "Gold Patron" | "Silver Patron" | "Gold" | "Silver" | "Bronze" | "General" | string;
export type PaymentMode = "UPI" | "CASH" | "Cash" | "Bank" | "BANK_TRANSFER" | "Razorpay" | string;

export interface Donation {
  id: string;
  receiptNo: string;
  date: string;
  donorName: string;
  phone?: string;
  donorPhone?: string;
  donorEmail?: string;
  amount: number;
  paymentMode: PaymentMode | string;
  status?: string;
  sponsorTier?: SponsorTier;
  purpose: string;
  gotram?: string;
  isAnonymous?: boolean;
  transactionId?: string;
  panNumber?: string;
  collectedBy?: string;
  taxExempt80G?: boolean;
}

export type ExpenseCategory = string;
export type ExpenseStatus = "Pending" | "Approved" | "Paid" | "Rejected" | "APPROVED" | "PENDING" | "REJECTED" | string;

export interface Expense {
  id: string;
  voucherNo: string;
  title?: string;
  date: string;
  category: string;
  description?: string;
  amount: number;
  paymentMode: string;
  paidTo?: string;
  vendorName?: string;
  status: ExpenseStatus;
  submittedBy?: string;
  approvedBy?: string;
  billUrl?: string;
}

export interface CashBookEntry {
  id: string;
  date: string;
  openingBalance?: number;
  totalIn?: number;
  totalOut?: number;
  closingBalance?: number;
  narration?: string;
  particulars?: string;
  type?: "Income" | "Expense";
  amount?: number;
  balance?: number;
  paymentMode?: PaymentMode | string;
  referenceId?: string;
}

export interface EventItem {
  id: string;
  day?: number;
  title: string;
  titleTe?: string;
  date: string;
  timing?: string;
  time?: string;
  category?: string;
  venue?: string;
  description: string;
  inCharge?: string;
  coordinator?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  available?: number;
  issued?: number;
  total?: number;
  condition: string;
  inCharge?: string;
  isRented?: boolean;
  vendorName?: string;
  rentPerDay?: number;
  deposit?: number;
}

export interface VolunteerDuty {
  id: string;
  volunteerId?: string;
  volunteerName: string;
  role: string;
  shift: string;
  location: string;
  status: string;
}

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  currentBid: number;
  highestBidder?: string;
  status: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  year: number;
  category: string;
  url: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: string;
  amount: number;
  logo?: string;
}

export interface AssociationSettings {
  associationName?: string;
  name?: string;
  shortName: string;
  registrationNo?: string;
  regNo?: string;
  establishedYear?: number;
  estYear?: string | number;
  address: string;
  presidentName: string;
  secretaryName: string;
  treasurerName: string;
  contactPhone: string;
  phone?: string;
  contactEmail: string;
  email?: string;
  upiVpa: string;
  upiId?: string;
  upiName: string;
  bankName: string;
  bankAccountNo: string;
  accountNo?: string;
  bankIfsc: string;
  ifscCode?: string;
  bankBranch: string;
  tax80GNo: string;
  goldenJubileeTarget: number;
  donationTarget?: number;
  chaturthiDate?: string;
}

export type Settings = AssociationSettings;

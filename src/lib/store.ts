"use client";

import {
  Member,
  Donation,
  Expense,
  CashBookEntry,
  EventItem,
  InventoryItem,
  VolunteerDuty,
  AuctionItem,
  GalleryItem,
  Sponsor,
  AssociationSettings,
} from "@/types";

export const INITIAL_SETTINGS: AssociationSettings = {
  associationName: "Victory Youth Association (Gudem Gally)",
  name: "Victory Youth Association",
  shortName: "Victory Youth",
  registrationNo: "TS/NZB/2008/4892",
  regNo: "TS/NZB/2008/4892",
  establishedYear: 1974,
  estYear: 1974,
  address: "Gudem Gally, Banswada, Kamareddy Dist., Telangana - 503187",
  presidentName: "V. Rajeshwar Rao",
  secretaryName: "Ch. Srinivas",
  treasurerName: "M. Laxmi Narayana",
  contactPhone: "+91 98765 43210",
  phone: "+91 98765 43210",
  contactEmail: "contact@ganeshbns.org",
  email: "contact@ganeshbns.org",
  upiVpa: "vya.ganesh@sbi",
  upiId: "vya.ganesh@sbi",
  upiName: "Victory Youth Association Banswada",
  bankName: "State Bank of India",
  bankAccountNo: "38291048592",
  accountNo: "38291048592",
  bankIfsc: "SBIN0001234",
  ifscCode: "SBIN0001234",
  bankBranch: "Banswada Main Branch",
  tax80GNo: "80G/AAATV1234F/2020-21",
  goldenJubileeTarget: 2500000,
  donationTarget: 2500000,
  chaturthiDate: "2026-08-27",
};

export const INITIAL_MEMBERS: Member[] = [
  { id: "m-1", memberId: "VYA-001", name: "K. Sandeep Raju", fullName: "K. Sandeep Raju", fatherName: "K. Rama Rao", mobile: "9876543210", phone: "9876543210", role: "SUPER_ADMIN", status: "Active", membershipFee: 5000, joinedYear: 2008, memberSince: "2008", photoUrl: "", attendanceCount: 36, gotram: "Shiva Gotram", isActive: true },
  { id: "m-2", memberId: "VYA-002", name: "V. Rajeshwar Rao", fullName: "V. Rajeshwar Rao", fatherName: "V. Satyanarayana", mobile: "9440112345", phone: "9440112345", role: "PRESIDENT", status: "Active", membershipFee: 10000, joinedYear: 1990, memberSince: "1990", photoUrl: "", attendanceCount: 48, gotram: "Kashyapa", isActive: true },
  { id: "m-3", memberId: "VYA-003", name: "M. Laxmi Narayana", fullName: "M. Laxmi Narayana", fatherName: "M. Gourishankar", mobile: "9849054321", phone: "9849054321", role: "TREASURER", status: "Active", membershipFee: 5000, joinedYear: 1995, memberSince: "1995", photoUrl: "", attendanceCount: 45, gotram: "Bharadwaja", isActive: true },
  { id: "m-4", memberId: "VYA-004", name: "Ch. Srinivas", fullName: "Ch. Srinivas", fatherName: "Ch. Narasimha", mobile: "9989098765", phone: "9989098765", role: "SECRETARY", status: "Active", membershipFee: 5000, joinedYear: 2002, memberSince: "2002", photoUrl: "", attendanceCount: 42, gotram: "Vasishtha", isActive: true },
  { id: "m-5", memberId: "VYA-005", name: "P. Ramesh Kumar", fullName: "P. Ramesh Kumar", fatherName: "P. Ramachandram", mobile: "9701234567", phone: "9701234567", role: "EVENT_INCHARGE", status: "Active", membershipFee: 3000, joinedYear: 2008, memberSince: "2008", photoUrl: "", attendanceCount: 38, gotram: "Shiva Gotram", isActive: true },
];

export const INITIAL_DONATIONS: Donation[] = [
  { id: "don-1", receiptNo: "VYA-2026-0001", donorName: "Sri K. Rajeshwar Rao", phone: "9848011111", donorPhone: "9848011111", gotram: "Shiva Gotram", amount: 100000, paymentMode: "UPI", transactionId: "UPI8492019", purpose: "Golden Jubilee Maha Sponsor", date: "2026-08-15", collectedBy: "K. Srinivas Goud", taxExempt80G: true },
  { id: "don-2", receiptNo: "VYA-2026-0002", donorName: "T. Venkat Ramana & Brothers", phone: "9848022222", donorPhone: "9848022222", gotram: "Kashyapa", amount: 50000, paymentMode: "CASH", purpose: "Maha Annadanam Sponsorship", date: "2026-08-18", collectedBy: "V. Santosh Kumar", taxExempt80G: true },
  { id: "don-3", receiptNo: "VYA-2026-0003", donorName: "M. Laxmi Narayana", phone: "9848033333", donorPhone: "9848033333", gotram: "Bharadwaja", amount: 25000, paymentMode: "UPI", transactionId: "UPI9023412", purpose: "Laddu Prasadam Seva", date: "2026-08-20", collectedBy: "M. Rajesh Verma", taxExempt80G: true },
  { id: "don-4", receiptNo: "VYA-2026-0004", donorName: "Gudem Gally Youth Group", phone: "9848044444", donorPhone: "9848044444", gotram: "Shiva Gotram", amount: 15000, paymentMode: "UPI", transactionId: "UPI1238947", purpose: "Lighting & Decoration", date: "2026-08-22", collectedBy: "A. Suresh Reddy", taxExempt80G: true },
  { id: "don-5", receiptNo: "VYA-2026-0005", donorName: "Ch. Sai Krishna", phone: "9848055555", donorPhone: "9848055555", gotram: "Vasishtha", amount: 5116, paymentMode: "UPI", transactionId: "UPI7782910", purpose: "Daily Pooja Seva", date: "2026-08-24", collectedBy: "P. Raju", taxExempt80G: true },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: "exp-1", voucherNo: "VYA-EXP-001", title: "Grand Mandapam & Wooden Stage Setup", category: "Mandapam", amount: 45000, paidTo: "Balaji Tent House, Banswada", vendorName: "Balaji Tent House", paymentMode: "BANK_TRANSFER", approvedBy: "K. Srinivas Goud", date: "2026-08-12", status: "APPROVED" },
  { id: "exp-2", voucherNo: "VYA-EXP-002", title: "50-Feet Ganesh Idol Advance Adornment", category: "Idol", amount: 35000, paidTo: "Siri Ganesh Arts Dhoolpet", vendorName: "Siri Ganesh Arts", paymentMode: "UPI", approvedBy: "V. Santosh Kumar", date: "2026-08-14", status: "APPROVED" },
  { id: "exp-3", voucherNo: "VYA-EXP-003", title: "DJ & 3D LED Lighting System Advance", category: "Sound & Lights", amount: 20000, paidTo: "Rockstar Sounds, Nizamabad", vendorName: "Rockstar Sounds", paymentMode: "UPI", approvedBy: "M. Rajesh Verma", date: "2026-08-17", status: "APPROVED" },
  { id: "exp-4", voucherNo: "VYA-EXP-004", title: "Pooja Samagri, Dhoop & Fruits", category: "Pooja Samagri", amount: 8500, paidTo: "Siri Rama Pooja Stores", vendorName: "Siri Rama Pooja Stores", paymentMode: "CASH", approvedBy: "A. Suresh Reddy", date: "2026-08-20", status: "APPROVED" },
];

export const INITIAL_EVENTS: EventItem[] = [
  { id: "evt-1", day: 1, title: "Ganapathi Prathisthapana & Maha Homam", description: "Grand prathisthapana with Vedic pandits, followed by Ganapathi Homam.", date: "2026-08-27", timing: "08:30 AM - 01:00 PM", inCharge: "K. Srinivas Goud" },
  { id: "evt-2", day: 2, title: "Sri Sukta Homam & Kumkumarchana", description: "Special Kumkumarchana for women devotees and Sri Sukta Homam.", date: "2026-08-28", timing: "09:00 AM - 12:30 PM", inCharge: "M. Rajesh Verma" },
  { id: "evt-3", day: 3, title: "Sahasranama Archana & Bhajan", description: "1008 Ganesha Namas chanting followed by Devotional Bhajans.", date: "2026-08-29", timing: "06:30 PM - 10:00 PM", inCharge: "V. Santosh Kumar" },
  { id: "evt-5", day: 5, title: "Maha Annadanam (10,000+ Devotees)", description: "Grand feast annadanam seva for all devotees across Banswada.", date: "2026-08-31", timing: "12:00 PM - 05:00 PM", inCharge: "A. Suresh Reddy" },
  { id: "evt-11", day: 11, title: "Grand Visarjan Shobhayatra", description: "50th Golden Jubilee Grand Immersion Procession with DJ, Nashik Dhol, & Fireworks.", date: "2026-09-06", timing: "02:00 PM - Late Night", inCharge: "K. Srinivas Goud" },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Silver Chhatra (Crown & Umbrella)", category: "Precious Ornaments", quantity: 1, unit: "set", condition: "Excellent", inCharge: "V. Santosh Kumar", available: 1, issued: 0, total: 1 },
  { id: "inv-2", name: "Brass Harathi Diyas (5-Tier)", category: "Pooja Vessels", quantity: 4, unit: "pieces", condition: "Good", inCharge: "A. Suresh Reddy", available: 4, issued: 0, total: 4 },
  { id: "inv-3", name: "Laddu Prasadam Boxes (500g)", category: "Prasadam Packaging", quantity: 2500, unit: "boxes", condition: "New", inCharge: "P. Raju", available: 2500, issued: 0, total: 2500 },
  { id: "inv-4", name: "VYA Golden Jubilee Saffron Flags", category: "Decoration", quantity: 1000, unit: "flags", condition: "New", inCharge: "M. Rajesh Verma", available: 1000, issued: 0, total: 1000 },
];

export const INITIAL_VOLUNTEERS: VolunteerDuty[] = [
  { id: "vol-1", volunteerName: "P. Raju", role: "Morning Aarti & Prasadam", shift: "07:00 AM - 11:00 AM", location: "Mandapam Inside", status: "ASSIGNED" },
  { id: "vol-2", volunteerName: "Sanjeev Kumar", role: "Annadanam Food Counter", shift: "11:30 AM - 04:00 PM", location: "Dining Hall", status: "ASSIGNED" },
  { id: "vol-3", volunteerName: "Vikram Reddy", role: "Traffic & Queue Control", shift: "05:30 PM - 10:30 PM", location: "Gudem Gally Entrance", status: "ASSIGNED" },
  { id: "vol-4", volunteerName: "Manoj Goud", role: "Night Security & Lighting", shift: "11:00 PM - 06:00 AM", location: "Mandapam Premises", status: "ASSIGNED" },
];

export const INITIAL_AUCTIONS: AuctionItem[] = [
  { id: "auc-1", title: "50th Year Maha Laddu Prasadam (21 KG)", description: "Sacred Laddu Prasadam offered to Banswada Ka Raja for 11 days.", basePrice: 50000, currentBid: 175000, highestBidder: "K. Rajeshwar Rao", status: "ACTIVE" },
  { id: "auc-2", title: "Silver Zari Sacred Vastram", description: "Special blessed silk vastram donned by Lord Ganesha.", basePrice: 10000, currentBid: 45000, highestBidder: "T. Venkat Ramana", status: "ACTIVE" },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  { id: "gal-1", title: "Ganesh Chaturthi Maha Aarti", year: 2025, category: "Aarti", url: "https://images.unsplash.com/photo-1567794639-9e54e66dee44?w=800" },
  { id: "gal-2", title: "Grand Visarjan Shobhayatra", year: 2024, category: "Visarjan", url: "https://images.unsplash.com/photo-1567794125-96cf7070c202?w=800" },
  { id: "gal-3", title: "Maha Laddu Auction Celebration", year: 2023, category: "Auction", url: "https://images.unsplash.com/photo-1531966639870-d81dba7b7002?w=800" },
  { id: "gal-4", title: "Annadanam Maha Seva", year: 2022, category: "Annadanam", url: "https://images.unsplash.com/photo-1544816155-77574b747aa6?w=800" },
];

export const INITIAL_SPONSORS: Sponsor[] = [
  { id: "spn-1", name: "Sri K. Rajeshwar Rao & Family", tier: "Maha Raja Patron", amount: 100000 },
  { id: "spn-2", name: "T. Venkat Ramana & Brothers", tier: "Diamond Patron", amount: 50000 },
  { id: "spn-3", name: "M. Laxmi Narayana", tier: "Gold Patron", amount: 25000 },
  { id: "spn-4", name: "Gudem Gally Youth Team", tier: "Silver Patron", amount: 15000 },
];

export class GaneshStore {
  private settings: AssociationSettings = INITIAL_SETTINGS;
  private members: Member[] = INITIAL_MEMBERS;
  private donations: Donation[] = INITIAL_DONATIONS;
  private expenses: Expense[] = INITIAL_EXPENSES;
  private events: EventItem[] = INITIAL_EVENTS;
  private inventory: InventoryItem[] = INITIAL_INVENTORY;
  private volunteers: VolunteerDuty[] = INITIAL_VOLUNTEERS;
  private auctions: AuctionItem[] = INITIAL_AUCTIONS;
  private gallery: GalleryItem[] = INITIAL_GALLERY;
  private sponsors: Sponsor[] = INITIAL_SPONSORS;

  getSettings(): AssociationSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<AssociationSettings>) {
    this.settings = { ...this.settings, ...updates };
  }

  getMembers(): Member[] {
    return this.members;
  }

  addMember(member: Member) {
    this.members.unshift(member);
  }

  updateMember(id: string, updates: Partial<Member>) {
    this.members = this.members.map((m) => (m.id === id ? { ...m, ...updates } : m));
  }

  deleteMember(id: string) {
    this.members = this.members.filter((m) => m.id !== id);
  }

  getDonations(): Donation[] {
    return this.donations;
  }

  addDonation(donation: Donation) {
    this.donations.unshift(donation);
  }

  getTotalDonations(): number {
    return this.donations.reduce((sum, d) => sum + d.amount, 0);
  }

  getExpenses(): Expense[] {
    return this.expenses;
  }

  addExpense(expense: Expense) {
    this.expenses.unshift(expense);
  }

  updateExpense(id: string, updates: Partial<Expense>) {
    this.expenses = this.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }

  getTotalExpenses(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  getBankBalance(): number {
    return this.getTotalDonations() - this.getTotalExpenses();
  }

  getCashBook(): CashBookEntry[] {
    return [
      { id: "cb-1", date: "2026-08-25", particulars: "Opening Balance", type: "Income", amount: 50000, balance: 50000, paymentMode: "Bank" },
      { id: "cb-2", date: "2026-08-25", particulars: "Donations Collected (UPI & Cash)", type: "Income", amount: this.getTotalDonations(), balance: 50000 + this.getTotalDonations(), paymentMode: "UPI" },
      { id: "cb-3", date: "2026-08-25", particulars: "Festival Expenses Approved", type: "Expense", amount: this.getTotalExpenses(), balance: 50000 + this.getTotalDonations() - this.getTotalExpenses(), paymentMode: "Bank" },
    ];
  }

  addCashBookEntry(entry: CashBookEntry) {
    // optional helper
  }

  getEvents(): EventItem[] {
    return this.events;
  }

  addEvent(event: EventItem) {
    this.events.push(event);
  }

  getInventory(): InventoryItem[] {
    return this.inventory;
  }

  addInventory(item: InventoryItem) {
    this.inventory.unshift(item);
  }

  getVolunteers(): VolunteerDuty[] {
    return this.volunteers;
  }

  addVolunteer(duty: VolunteerDuty) {
    this.volunteers.unshift(duty);
  }

  getAuctions(): AuctionItem[] {
    return this.auctions;
  }

  placeAuctionBid(itemId: string, amount: number, bidder: string) {
    return this.placeBid(itemId, amount, bidder);
  }

  getVolunteerDuties(): VolunteerDuty[] {
    return this.getVolunteers();
  }

  placeBid(itemId: string, amount: number, highestBidder: string) {
    this.auctions = this.auctions.map((a) =>
      a.id === itemId ? { ...a, currentBid: amount, highestBidder: highestBidder } : a
    );
  }

  getGallery(): GalleryItem[] {
    return this.gallery;
  }

  getSponsors(): Sponsor[] {
    return this.sponsors;
  }
}

export const ganeshStore = new GaneshStore();

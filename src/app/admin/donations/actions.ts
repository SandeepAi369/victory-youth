"use server";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { ne } from "drizzle-orm";

export async function getDonationEntries() {
  await requireAdmin();
  try {
    const db = getDb();
    const { desc } = await import("drizzle-orm");
    return await db.select({ id: schema.donations.id, receiptNo: schema.donations.receiptNo, donorName: schema.donations.donorName, phone: schema.donations.phone, amount: schema.donations.amount, category: schema.donations.category, purpose: schema.donations.purpose, paymentMode: schema.donations.paymentMode, date: schema.donations.date, isPublished: schema.donations.isPublished, isAnonymous: schema.donations.isAnonymous, contributorId: schema.donations.contributorId, createdAt: schema.donations.createdAt }).from(schema.donations)
      .where(ne(schema.donations.category, "CHANDA"))
      .orderBy(desc(schema.donations.createdAt));
  } catch (error) {
    console.error("getDonationEntries error:", error);
    return [];
  }
}

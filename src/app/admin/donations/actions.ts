"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import type { NewDonationRow } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/admin/donations");
  revalidatePath("/donations");
  revalidatePath("/");
}

/** Generates a cryptographically unique receipt number — no collisions */
function generateReceiptNo(): string {
  const year = new Date().getFullYear();
  const unique = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REC-${year}-${unique}`;
}

export async function getDonationEntries() {
  await requireAdmin();
  try {
    const db = getDb();
    const { desc } = await import("drizzle-orm");
    return await db.select({ id: schema.donations.id, receiptNo: schema.donations.receiptNo, donorName: schema.donations.donorName, phone: schema.donations.phone, amount: schema.donations.amount, category: schema.donations.category, purpose: schema.donations.purpose, paymentMode: schema.donations.paymentMode, date: schema.donations.date, isPublished: schema.donations.isPublished, isAnonymous: schema.donations.isAnonymous, createdAt: schema.donations.createdAt }).from(schema.donations)
      .where(ne(schema.donations.category, "CHANDA"))
      .orderBy(desc(schema.donations.createdAt));
  } catch (error) {
    console.error("getDonationEntries error:", error);
    return [];
  }
}

export async function addDonation(data: {
  donorName: string; phone: string; amount: number;
  category: string; paymentMode: string; date: string; purpose?: string;
  isAnonymous?: boolean;
}) {
  await requireAdmin();
  try {
    const db = getDb();
    const id = `don_${randomUUID()}`;
    const receiptNo = generateReceiptNo();
    await db.insert(schema.donations).values({
      id, receiptNo,
      donorName: data.donorName, phone: data.phone, amount: data.amount,
      category: data.category || "DONATION", purpose: data.purpose || "General Donation",
      paymentMode: data.paymentMode, status: "SUCCESS", date: data.date, isPublished: false, isAnonymous: !!data.isAnonymous,
    });
    revalidate();
    return { success: true, receiptNo };
  } catch (error) {
    console.error("addDonation error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateDonation(id: string, data: Partial<NewDonationRow>) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.donations).set(data).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateDonation error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteDonation(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.donations).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteDonation error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function toggleDonationPublish(id: string, publish: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.donations).set({ isPublished: publish }).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("toggleDonationPublish error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Hide (true) or show (false) the donor's name on the public site */
export async function toggleDonationAnonymous(id: string, anonymous: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.donations).set({ isAnonymous: anonymous }).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("toggleDonationAnonymous error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Master toggle: publish or unpublish ALL donations (non-CHANDA) at once */
export async function setAllDonationsVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.donations)
      .set({ isPublished: publish })
      .where(ne(schema.donations.category, "CHANDA"));
    revalidate();
    return { success: true, newState: publish };
  } catch (error) {
    console.error("setAllDonationsVisibility error:", error);
    return { success: false, newState: !publish, error: errorMessage(error) };
  }
}

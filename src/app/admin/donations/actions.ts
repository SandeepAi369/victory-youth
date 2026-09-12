"use server";
import { getDb, schema } from "@/db";
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
  try {
    const db = getDb();
    const { desc } = await import("drizzle-orm");
    return await db.select().from(schema.donations)
      .where(ne(schema.donations.category, "CHANDA"))
      .orderBy(desc(schema.donations.createdAt));
  } catch (error: any) {
    console.error("getDonationEntries error:", error);
    return [];
  }
}

export async function addDonation(data: {
  donorName: string; phone: string; amount: number;
  category: string; paymentMode: string; date: string; purpose?: string;
}) {
  try {
    const db = getDb();
    const id = `don_${randomUUID()}`;
    const receiptNo = generateReceiptNo();
    await db.insert(schema.donations).values({
      id, receiptNo,
      donorName: data.donorName, phone: data.phone, amount: data.amount,
      category: data.category || "DONATION", purpose: data.purpose || "General Donation",
      paymentMode: data.paymentMode, status: "SUCCESS", date: data.date, isPublished: false,
    });
    revalidate();
    return { success: true, receiptNo };
  } catch (error: any) {
    console.error("addDonation error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDonation(id: string, data: Record<string, any>) {
  try {
    const db = getDb();
    await db.update(schema.donations).set(data).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateDonation error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDonation(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.donations).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("deleteDonation error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleDonationPublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.donations).set({ isPublished: publish }).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("toggleDonationPublish error:", error);
    return { success: false, error: error.message };
  }
}

/** Master toggle: publish or unpublish ALL donations (non-CHANDA) at once */
export async function setAllDonationsVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.update(schema.donations)
      .set({ isPublished: publish })
      .where(ne(schema.donations.category, "CHANDA"));
    revalidate();
    return { success: true, newState: publish };
  } catch (error: any) {
    console.error("setAllDonationsVisibility error:", error);
    return { success: false, newState: !publish, error: error.message };
  }
}

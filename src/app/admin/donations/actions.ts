"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidate() {
  revalidatePath("/admin/donations");
  revalidatePath("/donations");
  revalidatePath("/");
}

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

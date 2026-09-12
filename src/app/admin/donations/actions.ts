"use server";
import { getDb, schema } from "@/db";
import { eq, and, ne, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidate() {
  revalidatePath("/admin/donations");
  revalidatePath("/donations");
  revalidatePath("/");
}

export async function getDonationEntries() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.donations)
      .where(ne(schema.donations.category, "CHANDA"))
      .orderBy(desc(schema.donations.createdAt));
  } catch (error: any) {
    console.error("getDonationEntries error:", error);
    return [];
  }
}

export async function addDonation(data: {
  donorName: string;
  phone: string;
  amount: number;
  category: string;
  paymentMode: string;
  date: string;
  purpose?: string;
}) {
  try {
    const db = getDb();
    const id = `don_${Date.now()}`;
    const receiptNo = `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    await db.insert(schema.donations).values({
      id,
      receiptNo,
      donorName: data.donorName,
      phone: data.phone,
      amount: data.amount,
      category: data.category || "DONATION",
      purpose: data.purpose || "General Donation",
      paymentMode: data.paymentMode,
      status: "SUCCESS",
      date: data.date,
      isPublished: false,
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

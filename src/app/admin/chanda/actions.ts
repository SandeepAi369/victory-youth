"use server";
import { getDb, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidate() {
  revalidatePath("/admin/chanda");
  revalidatePath("/chanda");
  revalidatePath("/donations");
  revalidatePath("/");
}

export async function getChandaEntries() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.category, "CHANDA"))
      .orderBy(desc(schema.donations.createdAt));
  } catch (error: any) {
    console.error("getChandaEntries error:", error);
    return [];
  }
}

export async function addChanda(data: {
  donorName: string;
  phone: string;
  amount: number;
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
      category: "CHANDA",
      purpose: data.purpose || "Chanda",
      paymentMode: data.paymentMode,
      status: "SUCCESS",
      date: data.date,
      isPublished: false,
    });
    revalidate();
    return { success: true, receiptNo };
  } catch (error: any) {
    console.error("addChanda error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateChanda(id: string, data: Record<string, any>) {
  try {
    const db = getDb();
    await db.update(schema.donations).set(data).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateChanda error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteChanda(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.donations).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("deleteChanda error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleChandaPublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.donations).set({ isPublished: publish }).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("toggleChandaPublish error:", error);
    return { success: false, error: error.message };
  }
}

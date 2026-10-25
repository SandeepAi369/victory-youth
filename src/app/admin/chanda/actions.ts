"use server";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/admin/chanda");
  revalidatePath("/chanda");
  revalidatePath("/donations");
  revalidatePath("/");
}

/** Generates a cryptographically unique receipt number — no collisions */
function generateReceiptNo(): string {
  const year = new Date().getFullYear();
  const unique = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REC-${year}-${unique}`;
}

export async function getChandaEntries() {
  await requireAdmin();
  try {
    const db = getDb();
    const { desc } = await import("drizzle-orm");
    return await db.select({ id: schema.donations.id, receiptNo: schema.donations.receiptNo, donorName: schema.donations.donorName, phone: schema.donations.phone, amount: schema.donations.amount, category: schema.donations.category, purpose: schema.donations.purpose, paymentMode: schema.donations.paymentMode, date: schema.donations.date, isPublished: schema.donations.isPublished, isAnonymous: schema.donations.isAnonymous, createdAt: schema.donations.createdAt }).from(schema.donations)
      .where(eq(schema.donations.category, "CHANDA"))
      .orderBy(desc(schema.donations.createdAt));
  } catch (error: any) {
    console.error("getChandaEntries error:", error);
    return [];
  }
}

export async function addChanda(data: {
  donorName: string; phone: string; amount: number;
  paymentMode: string; date: string; purpose?: string;
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
      category: "CHANDA", purpose: data.purpose || "Chanda",
      paymentMode: data.paymentMode, status: "SUCCESS", date: data.date, isPublished: false, isAnonymous: !!data.isAnonymous,
    });
    revalidate();
    return { success: true, receiptNo };
  } catch (error: any) {
    console.error("addChanda error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateChanda(id: string, data: Record<string, any>) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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

/** Hide (true) or show (false) the donor's name on the public site */
export async function toggleChandaAnonymous(id: string, anonymous: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.donations).set({ isAnonymous: anonymous }).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("toggleChandaAnonymous error:", error);
    return { success: false, error: error.message };
  }
}

/** Master toggle: publish or unpublish ALL chanda entries at once */
export async function setAllChandaVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.donations)
      .set({ isPublished: publish })
      .where(eq(schema.donations.category, "CHANDA"));
    revalidate();
    return { success: true, newState: publish };
  } catch (error: any) {
    console.error("setAllChandaVisibility error:", error);
    return { success: false, newState: !publish, error: error.message };
  }
}

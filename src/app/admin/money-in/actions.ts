"use server";

import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

function revalidate() {
  after(() => { revalidatePath("/"); revalidatePath("/admin/money-in"); revalidatePath("/admin"); });
}

export async function addMoneyIn(data: { donorName: string; phone: string; amount: number; category: string; purpose?: string; paymentMode: string; date: string }) {
  try {
    const db = getDb();
    const id = `don_${Date.now()}`;
    const receiptNo = `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    await db.insert(schema.donations).values({ id, receiptNo, donorName: data.donorName, phone: data.phone, amount: data.amount, category: data.category, purpose: data.purpose || "General", paymentMode: data.paymentMode, status: "SUCCESS", date: data.date, isPublished: false });
    revalidate();
    return { success: true, receiptNo };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function updateMoneyIn(id: string, data: Record<string, any>) {
  try {
    const db = getDb();
    await db.update(schema.donations).set(data).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteMoneyIn(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.donations).where(eq(schema.donations.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function togglePublish(table: "donations" | "transactions", id: string, publish: boolean) {
  try {
    const db = getDb();
    const t = table === "donations" ? schema.donations : schema.transactions;
    await db.update(t).set({ isPublished: publish } as any).where(eq(t.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function bulkTogglePublish(table: "donations" | "transactions", publish: boolean, category?: string) {
  try {
    const db = getDb();
    const t = table === "donations" ? schema.donations : schema.transactions;
    if (category) {
      const { and } = await import("drizzle-orm");
      await db.update(t).set({ isPublished: publish } as any).where(and(eq((t as any).category, category)));
    } else {
      await db.update(t).set({ isPublished: publish } as any);
    }
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

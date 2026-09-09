"use server";

import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

function revalidate() {
  after(() => { revalidatePath("/admin"); revalidatePath("/admin/money-out"); revalidatePath("/admin/summary"); });
}

export async function addExpense(data: { title: string; amount: number; category: string; paidTo: string; mode: string; date: string }) {
  try {
    const db = getDb();
    const id = `txn_${Date.now()}`;
    const voucherNo = `VCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    await db.insert(schema.transactions).values({ id, voucherNo, type: "EXPENSE", category: data.category, amount: data.amount, mode: data.mode, title: data.title, paidTo: data.paidTo, status: "APPROVED", recordedBy: "Admin", date: data.date, isPublished: false });
    revalidate();
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function updateExpense(id: string, data: Record<string, any>) {
  try {
    const db = getDb();
    await db.update(schema.transactions).set(data).where(eq(schema.transactions.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteExpense(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function toggleExpensePublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.transactions).set({ isPublished: publish }).where(eq(schema.transactions.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

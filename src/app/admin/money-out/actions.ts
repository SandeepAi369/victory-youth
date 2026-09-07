"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addExpense(data: { title: string; amount: number; category: string; paidTo: string; mode: string; date: string }) {
  if (!db) return { success: false, error: "DB not connected" };
  const id = `txn_${Date.now()}`;
  const voucherNo = `VCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  try {
    await db.insert(schema.transactions).values({ id, voucherNo, type: "EXPENSE", category: data.category, amount: data.amount, mode: data.mode, title: data.title, paidTo: data.paidTo, status: "APPROVED", recordedBy: "Admin", date: data.date, isPublished: false });
    revalidatePath("/admin"); revalidatePath("/admin/money-out"); revalidatePath("/admin/summary");
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function updateExpense(id: string, data: Record<string, any>) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.update(schema.transactions).set(data).where(eq(schema.transactions.id, id));
    revalidatePath("/admin"); revalidatePath("/admin/money-out"); revalidatePath("/admin/summary");
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteExpense(id: string) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
    revalidatePath("/admin"); revalidatePath("/admin/money-out"); revalidatePath("/admin/summary");
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

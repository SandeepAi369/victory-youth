"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import type { NewInventoryItemRow } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}

export async function getInventory() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db.select({ id: schema.inventoryItems.id, name: schema.inventoryItems.name, category: schema.inventoryItems.category, quantity: schema.inventoryItems.quantity, condition: schema.inventoryItems.condition, inCharge: schema.inventoryItems.inCharge, unit: schema.inventoryItems.unit }).from(schema.inventoryItems).orderBy(schema.inventoryItems.name);
  } catch (error) {
    console.error("getInventory error:", error);
    return [];
  }
}

export async function addInventoryItem(data: Omit<NewInventoryItemRow, "id">) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.insert(schema.inventoryItems).values({ id: `inv_${randomUUID()}`, ...data });
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("addInventoryItem error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateInventoryItem(id: string, data: Partial<NewInventoryItemRow>) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.inventoryItems).set(data).where(eq(schema.inventoryItems.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateInventoryItem error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteInventoryItem(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteInventoryItem error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

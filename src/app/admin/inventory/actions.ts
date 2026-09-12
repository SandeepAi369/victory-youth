"use server";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}

export async function getInventory() {
  try {
    const db = getDb();
    return await db.select().from(schema.inventoryItems).orderBy(schema.inventoryItems.name);
  } catch (error: any) {
    console.error("getInventory error:", error);
    return [];
  }
}

export async function addInventoryItem(data: any) {
  try {
    const db = getDb();
    await db.insert(schema.inventoryItems).values({ id: `inv_${randomUUID()}`, ...data });
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("addInventoryItem error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInventoryItem(id: string, data: any) {
  try {
    const db = getDb();
    await db.update(schema.inventoryItems).set(data).where(eq(schema.inventoryItems.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateInventoryItem error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("deleteInventoryItem error:", error);
    return { success: false, error: error.message };
  }
}

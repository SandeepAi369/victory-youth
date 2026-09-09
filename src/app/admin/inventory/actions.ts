"use server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInventory() {
  if (!db) return [];
  try {
    return await db.select().from(schema.inventoryItems).orderBy(schema.inventoryItems.name);
  } catch (error: any) { console.error("getInventory error:", error); return []; }
}

export async function addInventoryItem(data: any) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    const id = `inv_${Date.now()}`;
    await db.insert(schema.inventoryItems).values({ id, ...data });
    revalidatePath("/"); revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) { console.error("addInventoryItem error:", error); return { success: false, error: error.message }; }
}

export async function updateInventoryItem(id: string, data: any) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.update(schema.inventoryItems).set(data).where(eq(schema.inventoryItems.id, id));
    revalidatePath("/"); revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) { console.error("updateInventoryItem error:", error); return { success: false, error: error.message }; }
}

export async function deleteInventoryItem(id: string) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    revalidatePath("/"); revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) { console.error("deleteInventoryItem error:", error); return { success: false, error: error.message }; }
}

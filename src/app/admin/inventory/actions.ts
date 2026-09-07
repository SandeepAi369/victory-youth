"use server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInventory() {
  return await db.select().from(schema.inventoryItems).orderBy(schema.inventoryItems.name);
}

export async function addInventoryItem(data: any) {
  const id = `inv_${Date.now()}`;
  await db.insert(schema.inventoryItems).values({ id, ...data });
  revalidatePath("/"); revalidatePath("/admin/inventory");
}

export async function updateInventoryItem(id: string, data: any) {
  await db.update(schema.inventoryItems).set(data).where(eq(schema.inventoryItems.id, id));
  revalidatePath("/"); revalidatePath("/admin/inventory");
}

export async function deleteInventoryItem(id: string) {
  await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
  revalidatePath("/"); revalidatePath("/admin/inventory");
}

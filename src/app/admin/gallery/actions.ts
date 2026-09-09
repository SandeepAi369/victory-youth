"use server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGallery() {
  if (!db) return [];
  try {
    return await db.select().from(schema.gallery).orderBy(schema.gallery.year);
  } catch (error: any) { console.error("getGallery error:", error); return []; }
}

export async function addGalleryItem(data: any) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    const id = `gal_${Date.now()}`;
    await db.insert(schema.gallery).values({ 
      id, title: data.title, url: data.url, 
      category: data.category || "General", year: data.year || 2026,
      uploadedBy: "Admin", isPublished: true,
    });
    revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
    return { success: true };
  } catch (error: any) { console.error("addGalleryItem error:", error); return { success: false, error: error.message }; }
}

export async function updateGalleryItem(id: string, data: any) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.update(schema.gallery).set(data).where(eq(schema.gallery.id, id));
    revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
    return { success: true };
  } catch (error: any) { console.error("updateGalleryItem error:", error); return { success: false, error: error.message }; }
}

export async function deleteGalleryItem(id: string) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.delete(schema.gallery).where(eq(schema.gallery.id, id));
    revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
    return { success: true };
  } catch (error: any) { console.error("deleteGalleryItem error:", error); return { success: false, error: error.message }; }
}

export async function toggleGalleryPublish(id: string, publish: boolean) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.update(schema.gallery).set({ isPublished: publish }).where(eq(schema.gallery.id, id));
    revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
    return { success: true };
  } catch (error: any) { console.error("toggleGalleryPublish error:", error); return { success: false, error: error.message }; }
}

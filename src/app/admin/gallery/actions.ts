"use server";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidate() {
  revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
}

export async function getGallery() {
  try {
    const db = getDb();
    return await db.select().from(schema.gallery).orderBy(schema.gallery.year);
  } catch (error: any) { console.error("getGallery error:", error); return []; }
}

export async function addGalleryItem(data: any) {
  try {
    const db = getDb();
    await db.insert(schema.gallery).values({ 
      id: `gal_${Date.now()}`, title: data.title, url: data.url, 
      category: data.category || "General", year: data.year || 2026,
      uploadedBy: "Admin", isPublished: true,
    });
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("addGalleryItem error:", error); return { success: false, error: error.message }; }
}

export async function updateGalleryItem(id: string, data: any) {
  try {
    const db = getDb();
    await db.update(schema.gallery).set(data).where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("updateGalleryItem error:", error); return { success: false, error: error.message }; }
}

export async function deleteGalleryItem(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.gallery).where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("deleteGalleryItem error:", error); return { success: false, error: error.message }; }
}

export async function toggleGalleryPublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.gallery).set({ isPublished: publish }).where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("toggleGalleryPublish error:", error); return { success: false, error: error.message }; }
}

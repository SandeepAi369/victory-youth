"use server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGallery() {
  return await db.select().from(schema.gallery).orderBy(schema.gallery.year);
}

export async function addGalleryItem(data: any) {
  const id = `gal_${Date.now()}`;
  await db.insert(schema.gallery).values({ 
    id, 
    title: data.title, 
    url: data.url, 
    category: data.category || "General", 
    year: data.year || 2026,
    uploadedBy: "Admin",
    isPublished: true,
  });
  revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
}

export async function updateGalleryItem(id: string, data: any) {
  await db.update(schema.gallery).set(data).where(eq(schema.gallery.id, id));
  revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
}

export async function deleteGalleryItem(id: string) {
  await db.delete(schema.gallery).where(eq(schema.gallery.id, id));
  revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
}


export async function toggleGalleryPublish(id: string, publish: boolean) {
  await db.update(schema.gallery).set({ isPublished: publish }).where(eq(schema.gallery.id, id));
  revalidatePath("/"); revalidatePath("/admin/gallery"); revalidatePath("/gallery");
}

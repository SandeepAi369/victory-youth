"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getMediaDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { destroyCloudinaryImage } from "@/lib/cloudinary-admin";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/**
 * Save a Cloudinary image record to the database.
 * Called AFTER the client has uploaded directly to Cloudinary.
 */
export async function saveGalleryImage(
  secureUrl: string,
  publicId: string,
  category: string,
  year: number
) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    await db.insert(schema.gallery).values({
      id: `gal_${randomUUID()}`,
      title: "Photo",
      url: secureUrl,
      cloudinaryPublicId: publicId,
      category: category || "General",
      year: year || 2026,
      uploadedBy: "Admin",
      isPublished: true,
    });
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("saveGalleryImage error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Replace an existing gallery image with a new Cloudinary upload.
 * Deletes old image from Cloudinary, updates DB row.
 */
export async function replaceGalleryImage(
  galleryId: string,
  newSecureUrl: string,
  newPublicId: string
) {
  await requireAdmin();
  try {
    const db = getMediaDb();

    // Get old public ID to delete from Cloudinary
    const rows = await db
      .select({ cfId: schema.gallery.cloudinaryPublicId })
      .from(schema.gallery)
      .where(eq(schema.gallery.id, galleryId));

    const oldPublicId = rows[0]?.cfId;
    if (oldPublicId) {
      await destroyCloudinaryImage(oldPublicId);
    }

    // Update DB with new image
    await db
      .update(schema.gallery)
      .set({
        url: newSecureUrl,
        cloudinaryPublicId: newPublicId,
      })
      .where(eq(schema.gallery.id, galleryId));

    revalidate();
    return { success: true };
  } catch (error) {
    console.error("replaceGalleryImage error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function getGallery() {
  await requireAdmin();
  try {
    const db = getMediaDb();
    return await db
      .select({
        id: schema.gallery.id,
        url: schema.gallery.url,
        category: schema.gallery.category,
        year: schema.gallery.year,
        isPublished: schema.gallery.isPublished,
        uploadedAt: schema.gallery.uploadedAt,
        cloudinaryPublicId: schema.gallery.cloudinaryPublicId,
      })
      .from(schema.gallery)
      .orderBy(schema.gallery.uploadedAt);
  } catch (error) {
    console.error("getGallery error:", error);
    return [];
  }
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();

    const rows = await db
      .select({ cfId: schema.gallery.cloudinaryPublicId })
      .from(schema.gallery)
      .where(eq(schema.gallery.id, id));

    const publicId = rows[0]?.cfId;
    if (publicId) {
      await destroyCloudinaryImage(publicId);
    }

    await db.delete(schema.gallery).where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteGalleryItem error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function toggleGalleryPublish(id: string, publish: boolean) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    await db
      .update(schema.gallery)
      .set({ isPublished: publish })
      .where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("toggleGalleryPublish error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function setAllGalleryVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getMediaDb();
    await db.update(schema.gallery).set({ isPublished: publish });
    revalidate();
    return { success: true, newState: publish };
  } catch (error) {
    console.error("setAllGalleryVisibility error:", error);
    return { success: false, newState: !publish, error: errorMessage(error) };
  }
}


"use server";
import { getDb, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

const CLOUD_NAME = "y5dnsgyb";
const API_KEY = "***REMOVED***";
const API_SECRET = "***REMOVED***";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/**
 * Save a Cloudinary image record to CockroachDB.
 * Called AFTER the client has uploaded directly to Cloudinary.
 */
export async function saveGalleryImage(
  secureUrl: string,
  publicId: string,
  category: string,
  year: number
) {
  try {
    const db = getDb();
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
  } catch (error: any) {
    console.error("saveGalleryImage error:", error);
    return { success: false, error: error.message };
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
  try {
    const db = getDb();

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
  } catch (error: any) {
    console.error("replaceGalleryImage error:", error);
    return { success: false, error: error.message };
  }
}

export async function getGallery() {
  try {
    const db = getDb();
    return await db
      .select({
        id: schema.gallery.id,
        url: schema.gallery.url,
        category: schema.gallery.category,
        year: schema.gallery.year,
        isPublished: schema.gallery.isPublished,
        uploadedAt: schema.gallery.uploadedAt,
        cloudinaryPublicId: schema.gallery.cloudinaryPublicId,
        _now: sql`NOW()`,
      })
      .from(schema.gallery)
      .orderBy(schema.gallery.uploadedAt);
  } catch (error: any) {
    console.error("getGallery error:", error);
    return [];
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    const db = getDb();

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
  } catch (error: any) {
    console.error("deleteGalleryItem error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleGalleryPublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db
      .update(schema.gallery)
      .set({ isPublished: publish })
      .where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("toggleGalleryPublish error:", error);
    return { success: false, error: error.message };
  }
}

export async function setAllGalleryVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.update(schema.gallery).set({ isPublished: publish });
    revalidate();
    return { success: true, newState: publish };
  } catch (error: any) {
    console.error("setAllGalleryVisibility error:", error);
    return { success: false, newState: !publish, error: error.message };
  }
}

/** Delete an image from Cloudinary via REST API (signed request) */
async function destroyCloudinaryImage(publicId: string): Promise<void> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = createHash("sha1").update(toSign).digest("hex");

    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          api_key: API_KEY,
          timestamp,
          signature,
        }),
      }
    );
  } catch (err) {
    console.error("Cloudinary destroy error:", err);
  }
}

"use server";
import { getDb, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

const CF_IMAGES_HASH = "g0kMHlYRsoNb1rbpdz3L7g";

/** Get Cloudflare secrets — works in both Workers (via bindings) and local dev (via process.env) */
function getCfCredentials(): { accountId: string; imagesToken: string } {
  let accountId = "";
  let imagesToken = "";

  // Try Cloudflare Workers bindings first (production)
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    accountId = env?.CLOUDFLARE_ACCOUNT_ID || "";
    imagesToken = env?.CLOUDFLARE_IMAGES_TOKEN || "";
  } catch {
    // Not in Cloudflare context — fall through to process.env
  }

  // Fallback to process.env (local dev)
  if (!accountId) accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "3599fd84a57a8884da174cd015d96e1e";
  if (!imagesToken) imagesToken = process.env.CLOUDFLARE_IMAGES_TOKEN || "";

  if (!imagesToken) {
    throw new Error("CLOUDFLARE_IMAGES_TOKEN is not configured. Add it as a Worker secret or in .env");
  }
  if (!accountId) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID is not configured. Add it as a Worker secret or in .env");
  }

  return { accountId, imagesToken };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

function cfImageUrl(imageId: string): string {
  return `https://imagedelivery.net/${CF_IMAGES_HASH}/${imageId}/public`;
}

/**
 * Step A+B: Server action returns a one-time Direct Upload URL from Cloudflare.
 * The client will use this URL to upload the file directly to CF (no file through server action).
 */
export async function getDirectUploadUrl(): Promise<{
  success: boolean;
  uploadUrl?: string;
  imageId?: string;
  error?: string;
}> {
  try {
    const { accountId, imagesToken } = getCfCredentials();

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${imagesToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requireSignedURLs: false }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data.errors?.[0]?.message || "Failed to get upload URL" };
    }

    return {
      success: true,
      uploadUrl: data.result.uploadURL,
      imageId: data.result.id,
    };
  } catch (error: any) {
    console.error("getDirectUploadUrl error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Step D: After the client uploads the file directly to CF,
 * save the CF image ID + delivery URL to CockroachDB.
 */
export async function saveGalleryImage(cfImageId: string, category: string, year: number) {
  try {
    const db = getDb();
    await db.insert(schema.gallery).values({
      id: `gal_${randomUUID()}`,
      title: "Photo",
      url: cfImageUrl(cfImageId),
      cloudinaryPublicId: cfImageId,
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
 * Replace an existing gallery image with a new one.
 * Deletes old CF image, updates DB row with new CF image ID + URL.
 */
export async function replaceGalleryImage(galleryId: string, newCfImageId: string) {
  try {
    const db = getDb();

    // Get old CF image ID to delete it
    const rows = await db.select({ cfId: schema.gallery.cloudinaryPublicId })
      .from(schema.gallery).where(eq(schema.gallery.id, galleryId));

    const oldCfId = rows[0]?.cfId;

    // Delete old image from CF (non-fatal if it fails)
    if (oldCfId) {
      try {
        const { accountId, imagesToken } = getCfCredentials();
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${oldCfId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${imagesToken}` } }
        );
      } catch (_) {}
    }

    // Update DB with new image
    await db.update(schema.gallery).set({
      url: cfImageUrl(newCfImageId),
      cloudinaryPublicId: newCfImageId,
    }).where(eq(schema.gallery.id, galleryId));

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
    return await db.select({
      id: schema.gallery.id,
      url: schema.gallery.url,
      category: schema.gallery.category,
      year: schema.gallery.year,
      isPublished: schema.gallery.isPublished,
      uploadedAt: schema.gallery.uploadedAt,
      cloudinaryPublicId: schema.gallery.cloudinaryPublicId,
      _now: sql`NOW()`,
    }).from(schema.gallery).orderBy(schema.gallery.uploadedAt);
  } catch (error: any) {
    console.error("getGallery error:", error);
    return [];
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    const db = getDb();

    const rows = await db.select({ cfId: schema.gallery.cloudinaryPublicId })
      .from(schema.gallery).where(eq(schema.gallery.id, id));

    const cfId = rows[0]?.cfId;

    // Delete from CF Images
    if (cfId) {
      try {
        const { accountId, imagesToken } = getCfCredentials();
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${cfId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${imagesToken}` } }
        );
      } catch (_) {}
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
    await db.update(schema.gallery).set({ isPublished: publish }).where(eq(schema.gallery.id, id));
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

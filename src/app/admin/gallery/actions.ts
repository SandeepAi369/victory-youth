"use server";
import { getDb, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "3599fd84a57a8884da174cd015d96e1e";
const CF_IMAGES_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN || "";
const CF_IMAGES_HASH = "g0kMHlYRsoNb1rbpdz3L7g";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/** Build the public delivery URL for a Cloudflare Image */
export function cfImageUrl(imageId: string, variant: string = "public"): string {
  return `https://imagedelivery.net/${CF_IMAGES_HASH}/${imageId}/${variant}`;
}

export async function getGallery() {
  try {
    const db = getDb();
    return await db.select({
      id: schema.gallery.id,
      title: schema.gallery.title,
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

/** Upload image to Cloudflare Images, save CF image ID + delivery URL to DB */
export async function uploadGalleryImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Untitled";
    const category = (formData.get("category") as string) || "General";
    const year = parseInt((formData.get("year") as string) || "2026", 10);

    if (!file || file.size === 0) {
      return { success: false, error: "No file selected" };
    }

    // Upload to Cloudflare Images
    const cfForm = new FormData();
    cfForm.append("file", file);

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${CF_IMAGES_TOKEN}` },
        body: cfForm,
      }
    );

    const cfData = await cfRes.json();

    if (!cfData.success) {
      console.error("CF Images upload failed:", cfData.errors);
      return { success: false, error: cfData.errors?.[0]?.message || "Upload failed" };
    }

    const cfImageId = cfData.result.id;
    const deliveryUrl = cfImageUrl(cfImageId);

    // Save to DB — url = delivery URL, cloudinaryPublicId = CF image ID (reusing column)
    const db = getDb();
    await db.insert(schema.gallery).values({
      id: `gal_${randomUUID()}`,
      title,
      url: deliveryUrl,
      cloudinaryPublicId: cfImageId,
      category,
      year,
      uploadedBy: "Admin",
      isPublished: true,
    });

    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("uploadGalleryImage error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGalleryItem(id: string, data: any) {
  try {
    const db = getDb();
    await db.update(schema.gallery).set({
      title: data.title,
      category: data.category,
      year: data.year,
    }).where(eq(schema.gallery.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateGalleryItem error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    const db = getDb();

    // Get the CF image ID before deleting
    const rows = await db.select({ cfId: schema.gallery.cloudinaryPublicId })
      .from(schema.gallery).where(eq(schema.gallery.id, id));

    const cfId = rows[0]?.cfId;

    // Delete from CF Images if we have the ID
    if (cfId && CF_IMAGES_TOKEN) {
      try {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${cfId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${CF_IMAGES_TOKEN}` },
          }
        );
      } catch (e) {
        console.warn("CF Images delete failed (non-fatal):", e);
      }
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

/** Delete ALL old gallery rows (wipe CockroachDB stored images) */
export async function wipeOldGallery() {
  try {
    const db = getDb();
    await db.delete(schema.gallery);
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("wipeOldGallery error:", error);
    return { success: false, error: error.message };
  }
}

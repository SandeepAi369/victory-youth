"use server";
import { requireAdmin } from "@/lib/admin-session";
import { getMediaDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID, createHash } from "crypto";

const CLOUD_NAME = "y5dnsgyb";
const API_KEY = "***REMOVED***";
const API_SECRET = "***REMOVED***";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function getBanners() {
  await requireAdmin();
  try {
    const db = getMediaDb();
    return await db
      .select({
        id: schema.banners.id,
        url: schema.banners.url,
        cloudinaryPublicId: schema.banners.cloudinaryPublicId,
        label: schema.banners.label,
        sortOrder: schema.banners.sortOrder,
        isPublished: schema.banners.isPublished,
        createdAt: schema.banners.createdAt,
      })
      .from(schema.banners)
      .orderBy(schema.banners.sortOrder);
  } catch (error: any) {
    console.error("getBanners error:", error);
    return [];
  }
}

export async function saveBanner(secureUrl: string, publicId: string, label: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();

    // Enforce max 3 banners
    const existing = await db.select({ id: schema.banners.id }).from(schema.banners);
    if (existing.length >= 3) {
      return { success: false, error: "Maximum 3 banners allowed. Delete one first." };
    }

    const trimmedLabel = (label || "").slice(0, 10);

    await db.insert(schema.banners).values({
      id: `ban_${randomUUID()}`,
      url: secureUrl,
      cloudinaryPublicId: publicId,
      label: trimmedLabel,
      sortOrder: existing.length,
      isPublished: true,
    });
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("saveBanner error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBannerLabel(id: string, label: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    const trimmedLabel = (label || "").slice(0, 10);
    await db.update(schema.banners).set({ label: trimmedLabel, updatedAt: new Date() }).where(eq(schema.banners.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateBannerLabel error:", error);
    return { success: false, error: error.message };
  }
}

export async function replaceBannerImage(bannerId: string, newSecureUrl: string, newPublicId: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    const rows = await db.select({ cfId: schema.banners.cloudinaryPublicId })
      .from(schema.banners).where(eq(schema.banners.id, bannerId));
    const oldPublicId = rows[0]?.cfId;
    if (oldPublicId) await destroyCloudinaryImage(oldPublicId);

    await db.update(schema.banners).set({
      url: newSecureUrl,
      cloudinaryPublicId: newPublicId,
      updatedAt: new Date(),
    }).where(eq(schema.banners.id, bannerId));

    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("replaceBannerImage error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    const rows = await db.select({ cfId: schema.banners.cloudinaryPublicId })
      .from(schema.banners).where(eq(schema.banners.id, id));
    const publicId = rows[0]?.cfId;
    if (publicId) await destroyCloudinaryImage(publicId);

    await db.delete(schema.banners).where(eq(schema.banners.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("deleteBanner error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleBannerPublish(id: string, publish: boolean) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    await db.update(schema.banners).set({ isPublished: publish }).where(eq(schema.banners.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("toggleBannerPublish error:", error);
    return { success: false, error: error.message };
  }
}

async function destroyCloudinaryImage(publicId: string): Promise<void> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = createHash("sha1").update(toSign).digest("hex");
    await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId, api_key: API_KEY, timestamp, signature }),
    });
  } catch (err) {
    console.error("Cloudinary destroy error:", err);
  }
}

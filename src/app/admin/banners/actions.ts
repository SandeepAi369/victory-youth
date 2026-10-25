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
  } catch (error) {
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
  } catch (error) {
    console.error("saveBanner error:", error);
    return { success: false, error: errorMessage(error) };
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
  } catch (error) {
    console.error("updateBannerLabel error:", error);
    return { success: false, error: errorMessage(error) };
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
  } catch (error) {
    console.error("replaceBannerImage error:", error);
    return { success: false, error: errorMessage(error) };
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
  } catch (error) {
    console.error("deleteBanner error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function toggleBannerPublish(id: string, publish: boolean) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    await db.update(schema.banners).set({ isPublished: publish }).where(eq(schema.banners.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("toggleBannerPublish error:", error);
    return { success: false, error: errorMessage(error) };
  }
}


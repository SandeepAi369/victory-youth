"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, getMediaDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { destroyCloudinaryImage } from "@/lib/cloudinary-admin";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/story");
}

export async function getStoryImage() {
  await requireAdmin();
  try {
    const db = getDb();
    const rows = await db
      .select({
        heroImageUrl: schema.associationSettings.heroImageUrl,
        heroImagePublicId: schema.associationSettings.heroImagePublicId,
        heroImageAlt: schema.associationSettings.heroImageAlt,
      })
      .from(schema.associationSettings)
      .where(eq(schema.associationSettings.id, "settings"));

    if (rows.length > 0) {
      return {
        url: rows[0].heroImageUrl || null,
        publicId: rows[0].heroImagePublicId || null,
        alt: rows[0].heroImageAlt || "Victory Youth Association",
      };
    }
    return { url: null, publicId: null, alt: "Victory Youth Association" };
  } catch (error) {
    console.error("getStoryImage error:", error);
    return { url: null, publicId: null, alt: "Victory Youth Association" };
  }
}

export async function saveStoryImage(secureUrl: string, publicId: string) {
  await requireAdmin();
  try {
    const db = getDb();

    // Get existing to delete old image from Cloudinary
    const existing = await getStoryImage();
    if (existing.publicId) {
      await destroyCloudinaryImage(existing.publicId);
    }

    // Check if settings row exists
    const rows = await db
      .select({ id: schema.associationSettings.id })
      .from(schema.associationSettings)
      .where(eq(schema.associationSettings.id, "settings"));

    if (rows.length > 0) {
      await db
        .update(schema.associationSettings)
        .set({
          heroImageUrl: secureUrl,
          heroImagePublicId: publicId,
          updatedAt: new Date(),
        })
        .where(eq(schema.associationSettings.id, "settings"));
    } else {
      await db.insert(schema.associationSettings).values({
        id: "settings",
        heroImageUrl: secureUrl,
        heroImagePublicId: publicId,
      });
    }

    revalidate();
    return { success: true };
  } catch (error) {
    console.error("saveStoryImage error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteStoryImage() {
  await requireAdmin();
  try {
    const db = getDb();
    const existing = await getStoryImage();
    if (existing.publicId) {
      await destroyCloudinaryImage(existing.publicId);
    }

    await db
      .update(schema.associationSettings)
      .set({
        heroImageUrl: null,
        heroImagePublicId: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.associationSettings.id, "settings"));

    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteStoryImage error:", error);
    return { success: false, error: errorMessage(error) };
  }
}



// ───── Hero Images (Carousel) ─────

export async function getHeroImages() {
  await requireAdmin();
  try {
    const db = getMediaDb();
    const rows = await db
      .select()
      .from(schema.heroImages)
      .orderBy(schema.heroImages.sortOrder);
    return rows;
  } catch (error) {
    console.error("getHeroImages error:", error);
    return [];
  }
}

export async function addHeroImage(secureUrl: string, publicId: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    // Check count — max 5
    const existing = await db.select().from(schema.heroImages);
    if (existing.length >= 5) {
      return { success: false, error: "Maximum 5 hero images allowed" };
    }
    const id = `hero_${randomUUID()}`;
    const maxSort = existing.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), 0);
    await db.insert(schema.heroImages).values({
      id,
      url: secureUrl,
      cloudinaryPublicId: publicId,
      sortOrder: maxSort + 1,
    });
    revalidate();
    return { success: true, id };
  } catch (error) {
    console.error("addHeroImage error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteHeroImage(id: string) {
  await requireAdmin();
  try {
    const db = getMediaDb();
    // Get image to destroy on Cloudinary
    const rows = await db
      .select()
      .from(schema.heroImages)
      .where(eq(schema.heroImages.id, id));
    if (rows.length > 0 && rows[0].cloudinaryPublicId) {
      await destroyCloudinaryImage(rows[0].cloudinaryPublicId);
    }
    await db.delete(schema.heroImages).where(eq(schema.heroImages.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteHeroImage error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

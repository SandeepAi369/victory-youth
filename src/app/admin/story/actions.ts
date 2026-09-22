"use server";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";

const CLOUD_NAME = "y5dnsgyb";
const API_KEY = "***REMOVED***";
const API_SECRET = "***REMOVED***";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/story");
}

export async function getStoryImage() {
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
  } catch (error: any) {
    console.error("getStoryImage error:", error);
    return { url: null, publicId: null, alt: "Victory Youth Association" };
  }
}

export async function saveStoryImage(secureUrl: string, publicId: string) {
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
  } catch (error: any) {
    console.error("saveStoryImage error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStoryImage() {
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
  } catch (error: any) {
    console.error("deleteStoryImage error:", error);
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


// ───── Hero Images (Carousel) ─────

export async function getHeroImages() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.heroImages)
      .orderBy(schema.heroImages.sortOrder);
    return rows;
  } catch (error: any) {
    console.error("getHeroImages error:", error);
    return [];
  }
}

export async function addHeroImage(secureUrl: string, publicId: string) {
  try {
    const db = getDb();
    // Check count — max 5
    const existing = await db.select().from(schema.heroImages);
    if (existing.length >= 5) {
      return { success: false, error: "Maximum 5 hero images allowed" };
    }
    const id = crypto.randomUUID();
    const maxSort = existing.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), 0);
    await db.insert(schema.heroImages).values({
      id,
      url: secureUrl,
      cloudinaryPublicId: publicId,
      sortOrder: maxSort + 1,
    });
    revalidate();
    return { success: true, id };
  } catch (error: any) {
    console.error("addHeroImage error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteHeroImage(id: string) {
  try {
    const db = getDb();
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
  } catch (error: any) {
    console.error("deleteHeroImage error:", error);
    return { success: false, error: error.message };
  }
}

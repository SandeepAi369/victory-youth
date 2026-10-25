/**
 * Public Data Queries — Ganesh BNS / Victory Youth Association
 *
 * Gallery, banners and hero images live in the MEDIA database (getMediaDb);
 * everything else is in the CORE database (getDb).
 */

import { getDb, getMediaDb, schema } from "@/db";
import { eq, desc, and, ne, or, sql } from "drizzle-orm";

/**
 * Public donor name: anonymous donations are masked inside the SQL query, so
 * the real name never leaves the database for public pages.
 */
const publicDonorName = sql<string>`CASE WHEN ${schema.donations.isAnonymous} = 1 THEN 'Anonymous Devotee' ELSE ${schema.donations.donorName} END`;

// ============================================
// ASSOCIATION SETTINGS
// ============================================

export async function getAssociationSettings() {
  try {
    const db = getDb();
    const rows = await db.select().from(schema.associationSettings).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error("❌ getAssociationSettings error:", error);
    return null;
  }
}

// ============================================
// PUBLIC STATS (homepage counters)
// ============================================

async function getPublicStats(existingSettings?: any) {
  try {
    const db = getDb();
    const settings = existingSettings !== undefined
      ? existingSettings
      : await getAssociationSettings();

    const [memberRows, donationRows, eventRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(schema.members).where(eq(schema.members.isActive, true)),
      db.select({
          total: sql<number>`coalesce(sum(amount), 0)`,
          count: sql<number>`count(*)`,
        })
        .from(schema.donations)
        .where(eq(schema.donations.isPublished, true)),
      db.select({ count: sql<number>`count(*)` })
        .from(schema.events).where(eq(schema.events.isPublished, true)),
    ]);

    return {
      totalMembers: Number(memberRows[0]?.count ?? 0),
      totalAmount: Math.round(Number(donationRows[0]?.total ?? 0)),
      totalDonations: Number(donationRows[0]?.count ?? 0),
      totalEvents: Number(eventRows[0]?.count ?? 0),
      donationTarget: Math.round(Number(settings?.donationTarget ?? 2500000)),
    };
  } catch (error) {
    console.error("❌ getPublicStats error:", error);
    return {
      totalMembers: 0, totalAmount: 0, totalDonations: 0,
      totalEvents: 0, donationTarget: 2500000,
    };
  }
}

// ============================================
// EVENTS
// ============================================

export async function getPublishedEvents() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.isPublished, true))
      .orderBy(schema.events.day);
  } catch (error) {
    console.error("❌ getPublishedEvents error:", error);
    return [];
  }
}

// ============================================
// NOTICES
// ============================================

export async function getPublishedNotices(limit: number = 10) {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.notices)
      .where(eq(schema.notices.status, "PUBLISHED"))
      .orderBy(desc(schema.notices.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedNotices error:", error);
    return [];
  }
}

// ============================================
// NOTES (Important Notes / Committee Updates)
// ============================================

export async function getPublishedNotes(limit: number = 10) {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.importantNotes)
      .where(eq(schema.importantNotes.isPublished, true))
      .orderBy(desc(schema.importantNotes.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedNotes error:", error);
    return [];
  }
}

// ============================================
// GALLERY
// ============================================

export async function getPublishedGallery(limit: number = 12) {
  try {
    const db = getMediaDb();
    return await db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.isPublished, true))
      .orderBy(desc(schema.gallery.uploadedAt))
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedGallery error:", error);
    return [];
  }
}

// ============================================
// DONATIONS (public-facing)
// ============================================

export async function getPublishedDonations(limit = 20) {
  try {
    const db = getDb();
    return await db
      .select({
        donorName: publicDonorName,
        amount: schema.donations.amount,
        category: schema.donations.category,
        date: schema.donations.date,
      })
      .from(schema.donations)
      .where(and(eq(schema.donations.isPublished, true), ne(schema.donations.category, "CHANDA")))
      .orderBy(desc(schema.donations.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedDonations error:", error);
    return [];
  }
}

/** A single successful donation for the public receipt page, by id or receipt number. */
export async function getReceiptDonation(idOrReceiptNo: string) {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.donations)
      .where(
        and(
          eq(schema.donations.status, "SUCCESS"),
          or(
            eq(schema.donations.id, idOrReceiptNo),
            eq(schema.donations.receiptNo, idOrReceiptNo),
            eq(schema.donations.receiptNo, `#${idOrReceiptNo}`)
          )
        )
      )
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error("❌ getReceiptDonation error:", error);
    return null;
  }
}

export async function getPublishedChanda(limit = 100) {
  try {
    const db = getDb();
    // Only the columns the public chanda page shows — no phone, address or PAN
    return await db
      .select({
        id: schema.donations.id,
        donorName: publicDonorName,
        amount: schema.donations.amount,
        purpose: schema.donations.purpose,
        date: schema.donations.date,
      })
      .from(schema.donations)
      .where(and(eq(schema.donations.isPublished, true), eq(schema.donations.category, "CHANDA")))
      .orderBy(desc(schema.donations.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedChanda error:", error);
    return [];
  }
}

// ============================================
// DONATION PURPOSES
// ============================================

export async function getActiveDonationPurposes() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.donationPurposes)
      .where(eq(schema.donationPurposes.isActive, true))
      .orderBy(schema.donationPurposes.sortOrder);
  } catch (error) {
    console.error("❌ getActiveDonationPurposes error:", error);
    return [];
  }
}

// ============================================
// HERO & FEATURED GALLERY (homepage)
// ============================================

export async function getHeroSection(existingSettings?: any) {
  const defaultHero = {
    title: "Victory Youth",
    subtitleEn: "50th Golden Jubilee Celebrations",
    subtitleTe: "50వ స్వర్ణోత్సవ వేడుకలు",
    imageUrl: null,
    imageAlt: "Victory Youth Association",
  };
  try {
    const settings = existingSettings !== undefined
      ? existingSettings
      : await getAssociationSettings();
    return {
      title: settings?.heroTitle || "Victory Youth",
      subtitleEn: settings?.heroSubtitleEn || "50th Golden Jubilee Celebrations",
      subtitleTe: settings?.heroSubtitleTe || "50వ స్వర్ణోత్సవ వేడుకలు",
      descriptionEn: settings?.heroDescriptionEn,
      descriptionTe: settings?.heroDescriptionTe,
      imageUrl: settings?.heroImageUrl || null,
      imagePublicId: settings?.heroImagePublicId,
      imageAlt: settings?.heroImageAlt || "Victory Youth Association",
    };
  } catch (error) {
    console.error("❌ getHeroSection error:", error);
    return defaultHero;
  }
}

export async function getFeaturedGallery(existingSettings?: any) {
  try {
    const settings = existingSettings !== undefined
      ? existingSettings
      : await getAssociationSettings();
    const featured: { url: string; alt: string; caption: string }[] = [];
    if (settings?.featuredGallery1Url)
      featured.push({ url: settings.featuredGallery1Url, alt: settings.featuredGallery1Alt || "Featured Photo 1", caption: settings.featuredGallery1Caption || "" });
    if (settings?.featuredGallery2Url)
      featured.push({ url: settings.featuredGallery2Url, alt: settings.featuredGallery2Alt || "Featured Photo 2", caption: settings.featuredGallery2Caption || "" });
    if (settings?.featuredGallery3Url)
      featured.push({ url: settings.featuredGallery3Url, alt: settings.featuredGallery3Alt || "Featured Photo 3", caption: settings.featuredGallery3Caption || "" });
    return featured;
  } catch (error) {
    console.error("❌ getFeaturedGallery error:", error);
    return [];
  }
}

// ============================================
// HOMEPAGE DATA AGGREGATION
// ============================================


// ============================================
// PUBLISHED BANNERS
// ============================================
export async function getPublishedBanners() {
  try {
    const db = getMediaDb();
    return await db
      .select({
        id: schema.banners.id,
        url: schema.banners.url,
        label: schema.banners.label,
        sortOrder: schema.banners.sortOrder,
      })
      .from(schema.banners)
      .where(eq(schema.banners.isPublished, true))
      .orderBy(schema.banners.sortOrder);
  } catch (error: any) {
    console.error("getPublishedBanners error:", error);
    return [];
  }
}

export async function getHeroImages() {
  try {
    const db = getMediaDb();
    const rows = await db
      .select({ id: schema.heroImages.id, url: schema.heroImages.url })
      .from(schema.heroImages)
      .orderBy(schema.heroImages.sortOrder);
    return rows;
  } catch (error) {
    console.error("getHeroImages error:", error);
    return [];
  }
}

export async function getHomepageData() {
  try {
    const settings = await getAssociationSettings();
    const [stats, hero, featuredGallery, events, notices, notes, publishedDonations, banners, heroImages] =
      await Promise.all([
        getPublicStats(settings),
        getHeroSection(settings),
        getFeaturedGallery(settings),
        getPublishedEvents(),
        getPublishedNotices(3),
        getPublishedNotes(5),
        getPublishedDonations(20),
        getPublishedBanners(),
      getHeroImages(),
      ]);
    return { settings, stats, hero, featuredGallery, events, notices, notes, publishedDonations, banners, heroImages };
  } catch (err) {
    console.error("❌ getHomepageData top-level error:", err);
    return {
      settings: null,
      stats: { totalDonations: 0, totalAmount: 0, totalMembers: 0, totalEvents: 0, donationTarget: 2500000 },
      hero: {
        title: "Victory Youth",
        subtitleEn: "50th Golden Jubilee Celebrations",
        subtitleTe: "50వ స్వర్ణోత్సవ వేడుకలు",
        imageUrl: null,
        imageAlt: "Victory Youth Association",
      },
      featuredGallery: [],
      events: [],
      notices: [],
      notes: [],
      publishedDonations: [],
      banners: [],
      heroImages: [],
    };
  }
}

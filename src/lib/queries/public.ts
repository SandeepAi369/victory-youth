/**
 * Public Data Queries for Ganesh BNS
 * 
 * These queries are used by public-facing pages (Home, Donate, Schedule)
 * and do not require authentication.
 */

import { getDb, schema } from "@/db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// ============================================
// ASSOCIATION SETTINGS
// ============================================

/**
 * Get association settings (single row)
 */
export async function getAssociationSettings() {
  const db = getDb();
  try {
    const settings = await db
      .select()
      .from(schema.associationSettings)
      .limit(1);
    
    return settings[0] || null;
  } catch (error) {
    console.error("Error fetching association settings:", error);
    return null;
  }
}

// ============================================
// PUBLIC STATS
// ============================================

/**
 * Get public stats for homepage display
 */
export async function getPublicStats(existingSettings?: any) {
  const db = getDb();

  try {
    // Get donation stats
    const donationStats = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, "SUCCESS"))
      .catch((e) => {
        console.error("Error fetching donation stats:", e);
        return [{ count: 0, total: 0 }];
      });

    // Get member count
    const memberStats = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.members)
      .where(eq(schema.members.isActive, true))
      .catch((e) => {
        console.error("Error fetching member stats:", e);
        return [{ count: 0 }];
      });

    // Get event count
    const eventStats = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.events)
      .where(eq(schema.events.isPublished, true))
      .catch((e) => {
        console.error("Error fetching event stats:", e);
        return [{ count: 0 }];
      });

    // Get donation target from settings
    const settings = existingSettings !== undefined ? existingSettings : await getAssociationSettings();

    return {
      totalDonations: donationStats[0]?.count || 0,
      totalAmount: donationStats[0]?.total || 0,
      totalMembers: memberStats[0]?.count || 0,
      totalEvents: eventStats[0]?.count || 0,
      donationTarget: settings?.donationTarget || 2500000,
    };
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return {
      totalDonations: 0,
      totalAmount: 0,
      totalMembers: 0,
      totalEvents: 0,
      donationTarget: 2500000,
    };
  }
}

// ============================================
// EVENTS / SCHEDULE
// ============================================

/**
 * Get published events for public schedule
 */
export async function getPublishedEvents() {
  const db = getDb();
  try {
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.isPublished, true))
      .orderBy(schema.events.date);

    return events;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getPublishedEvents:", error);
    return [];
  }
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(startDate: string, endDate: string) {
  const db = getDb();
  try {
    const events = await db
      .select()
      .from(schema.events)
      .where(
        and(
          eq(schema.events.isPublished, true),
          gte(schema.events.date, startDate),
          lte(schema.events.date, endDate)
        )
      )
      .orderBy(schema.events.date);

    return events;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getEventsByDateRange:", error);
    return [];
  }
}

// ============================================
// NOTICES
// ============================================

/**
 * Get published notices for public display
 */
export async function getPublishedNotices(limit: number = 5) {
  const db = getDb();
  try {
    const notices = await db
      .select()
      .from(schema.notices)
      .where(eq(schema.notices.status, "PUBLISHED"))
      .orderBy(desc(schema.notices.createdAt))
      .limit(limit);

    return notices;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getPublishedNotices:", error);
    return [];
  }
}

// ============================================
// SPONSORS
// ============================================

/**
 * Get published sponsors for homepage
 */
export async function getPublishedSponsors() {
  const db = getDb();
  try {
    const sponsors = await db
      .select()
      .from(schema.sponsors)
      .where(eq(schema.sponsors.isPublished, true))
      .orderBy(desc(schema.sponsors.displayOrder));

    return sponsors;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getPublishedSponsors:", error);
    return [];
  }
}

// ============================================
// GALLERY
// ============================================

/**
 * Get published gallery images
 */
export async function getPublishedGallery(limit: number = 12) {
  const db = getDb();
  try {
    const images = await db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.isPublished, true))
      .orderBy(desc(schema.gallery.uploadedAt))
      .limit(limit);

    return images;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getPublishedGallery:", error);
    return [];
  }
}

// ============================================
// DONATION PURPOSES
// ============================================

/**
 * Get active donation purposes for donate page
 */
export async function getActiveDonationPurposes() {
  const db = getDb();
  try {
    const purposes = await db
      .select()
      .from(schema.donationPurposes)
      .where(eq(schema.donationPurposes.isActive, true))
      .orderBy(schema.donationPurposes.sortOrder);

    return purposes;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getActiveDonationPurposes:", error);
    return [];
  }
}

// ============================================
// HERO IMAGE & FEATURED GALLERY
// ============================================

/**
 * Get hero section data for homepage
 */
export async function getHeroSection(existingSettings?: any) {
  const defaultHero = {
    title: "Victory Youth",
    subtitleEn: "50th Golden Jubilee Celebrations",
    subtitleTe: "50వ స్వర్ణోత్సవ వేడుకలు",
    imageUrl: null,
    imageAlt: "Victory Youth Association",
  };

  const db = getDb();
  try {
    const settings = existingSettings !== undefined ? existingSettings : await getAssociationSettings();
    
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
    console.error("Error fetching hero section:", error);
    return defaultHero;
  }
}

/**
 * Get featured gallery (3 photos) for homepage
 */
export async function getFeaturedGallery(existingSettings?: any) {
  const db = getDb();
  try {
    const settings = existingSettings !== undefined ? existingSettings : await getAssociationSettings();
    
    const featured: { url: string; alt: string; caption: string }[] = [];
    
    if (settings?.featuredGallery1Url) {
      featured.push({
        url: settings.featuredGallery1Url,
        alt: settings.featuredGallery1Alt || "Featured Photo 1",
        caption: settings.featuredGallery1Caption || "",
      });
    }
    
    if (settings?.featuredGallery2Url) {
      featured.push({
        url: settings.featuredGallery2Url,
        alt: settings.featuredGallery2Alt || "Featured Photo 2",
        caption: settings.featuredGallery2Caption || "",
      });
    }
    
    if (settings?.featuredGallery3Url) {
      featured.push({
        url: settings.featuredGallery3Url,
        alt: settings.featuredGallery3Alt || "Featured Photo 3",
        caption: settings.featuredGallery3Caption || "",
      });
    }
    
    return featured;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getFeaturedGallery:", error);
    return [];
  }
}

// ============================================
// NOTES
// ============================================

/**
 * Get published notes for frontend display
 */
export async function getPublishedNotes(limit: number = 10) {
  const db = getDb();
  try {
    const notes = await db
      .select()
      .from(schema.importantNotes)
      .where(eq(schema.importantNotes.isPublished, true))
      .orderBy(desc(schema.importantNotes.createdAt))
      .limit(limit);

    return notes;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getPublishedNotes:", error);
    return [];
  }
}

// ============================================
// PUBLISHED DONATIONS (for frontend display)
// ============================================
export async function getPublishedDonations(limit = 20) {
  const db = getDb();
  try {
    const donations = await db
      .select({ donorName: schema.donations.donorName, amount: schema.donations.amount, category: schema.donations.category, date: schema.donations.date })
      .from(schema.donations)
      .where(eq(schema.donations.isPublished, true))
      .orderBy(desc(schema.donations.createdAt))
      .limit(limit);
    return donations;
  } catch (error) {
    console.error("❌ DB QUERY FAILED in getPublishedDonations:", error);
    return [];
  }
}



// ============================================
// PUBLISHED CHANDA (filtered from donations)
// ============================================

export async function getPublishedChanda(limit = 100) {
  const db = getDb();
  try {
    return await db
      .select()
      .from(schema.donations)
      .where(
        and(
          eq(schema.donations.isPublished, true),
          eq(schema.donations.category, "CHANDA")
        )
      )
      .orderBy(desc(schema.donations.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching published chanda:", error);
    return [];
  }
}

// ============================================
// HOMEPAGE DATA AGGREGATION
// ============================================

/**
 * Get all homepage data in a single resilient call for SSR
 */
export async function getHomepageData() {
  try {
    // 1. Fetch settings first (single row, quick)
    const settings = await getAssociationSettings();

    // 2. Run other queries in parallel, passing pre-fetched settings
    const [
      stats,
      hero,
      featuredGallery,
      events,
      sponsors,
      notices,
      notes,
      publishedDonations,
    ] = await Promise.all([
      getPublicStats(settings),
      getHeroSection(settings),
      getFeaturedGallery(settings),
      getPublishedEvents(),
      getPublishedSponsors(),
      getPublishedNotices(3),
      getPublishedNotes(5),
      getPublishedDonations(20),
    ]);

    return {
      settings,
      stats,
      hero,
      featuredGallery,
      events,
      sponsors,
      notices,
      notes,
      publishedDonations,
    };
  } catch (err) {
    console.error("❌ getHomepageData caught top-level error:", err);
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
      sponsors: [],
      notices: [],
      notes: [],
      publishedDonations: [],
    };
  }
}

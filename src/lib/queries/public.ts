/**
 * Public Data Queries for Ganesh BNS
 * 
 * These queries are used by public-facing pages (Home, Donate, Schedule)
 * and do not require authentication.
 */

import { db, schema } from "@/db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// ============================================
// ASSOCIATION SETTINGS
// ============================================

/**
 * Get association settings (single row)
 */
export async function getAssociationSettings() {
  if (!db) return null;
  
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
export async function getPublicStats() {
  if (!db) {
    return {
      totalDonations: 0,
      totalAmount: 0,
      totalMembers: 0,
      totalEvents: 0,
      donationTarget: 2500000,
    };
  }

  try {
    // Get donation stats
    const donationStats = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, "SUCCESS"));

    // Get member count
    const memberStats = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.members)
      .where(eq(schema.members.isActive, true));

    // Get event count
    const eventStats = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.events)
      .where(eq(schema.events.isPublished, true));

    // Get donation target from settings
    const settings = await getAssociationSettings();

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
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

  try {
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.isPublished, true))
      .orderBy(schema.events.date);

    return events;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(startDate: string, endDate: string) {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

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
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}


// ============================================
// NOTICES
// ============================================

/**
 * Get published notices for public display
 */
export async function getPublishedNotices(limit: number = 5) {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

  try {
    const notices = await db
      .select()
      .from(schema.notices)
      .where(eq(schema.notices.status, "PUBLISHED"))
      .orderBy(desc(schema.notices.createdAt))
      .limit(limit);

    return notices;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}

// ============================================
// SPONSORS
// ============================================

/**
 * Get published sponsors for homepage
 */
export async function getPublishedSponsors() {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

  try {
    const sponsors = await db
      .select()
      .from(schema.sponsors)
      .where(eq(schema.sponsors.isPublished, true))
      .orderBy(desc(schema.sponsors.displayOrder));

    return sponsors;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}

// ============================================
// GALLERY
// ============================================

/**
 * Get published gallery images
 */
export async function getPublishedGallery(limit: number = 12) {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

  try {
    const images = await db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.isPublished, true))
      .orderBy(desc(schema.gallery.uploadedAt))
      .limit(limit);

    return images;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}


// ============================================
// DONATION PURPOSES
// ============================================

/**
 * Get active donation purposes for donate page
 */
export async function getActiveDonationPurposes() {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

  try {
    const purposes = await db
      .select()
      .from(schema.donationPurposes)
      .where(eq(schema.donationPurposes.isActive, true))
      .orderBy(schema.donationPurposes.sortOrder);

    return purposes;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}

// ============================================
// HERO IMAGE & FEATURED GALLERY
// ============================================

/**
 * Get hero section data for homepage
 */
export async function getHeroSection() {
  if (!db) {
    return {
      title: "Victory Youth",
      subtitleEn: "50th Golden Jubilee Celebrations",
      subtitleTe: "50వ స్వర్ణోత్సవ వేడుకలు",
      imageUrl: null,
      imageAlt: "Victory Youth Association",
    };
  }

  try {
    const settings = await getAssociationSettings();
    
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
    return {
      title: "Victory Youth",
      subtitleEn: "50th Golden Jubilee Celebrations",
      subtitleTe: "50వ స్వర్ణోత్సవ వేడుకలు",
      imageUrl: null,
      imageAlt: "Victory Youth Association",
    };
  }
}

/**
 * Get featured gallery (3 photos) for homepage
 */
export async function getFeaturedGallery() {
  if (!db) {
    return [];
  }

  try {
    const settings = await getAssociationSettings();
    
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
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}


// ============================================
// NOTES
// ============================================

/**
 * Get published notes for frontend display
 */
export async function getPublishedNotes(limit: number = 10) {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");

  try {
    const notes = await db
      .select()
      .from(schema.importantNotes)
      .where(eq(schema.importantNotes.isPublished, true))
      .orderBy(desc(schema.importantNotes.createdAt))
      .limit(limit);

    return notes;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}


// ============================================
// PUBLISHED DONATIONS (for frontend display)
// ============================================
export async function getPublishedDonations(limit = 20) {
  if (!db) throw new Error("Database connection not available. Check DATABASE_URL.");
  try {
    const donations = await db
      .select({ donorName: schema.donations.donorName, amount: schema.donations.amount, category: schema.donations.category, date: schema.donations.date })
      .from(schema.donations)
      .where(eq(schema.donations.isPublished, true))
      .orderBy(desc(schema.donations.createdAt))
      .limit(limit);
    return donations;
  } catch (error) { console.error("❌ DB QUERY FAILED:", error); throw error; }
}

// ============================================
// HOMEPAGE DATA AGGREGATION
// ============================================

/**
 * Get all homepage data in a single call for SSR
 */
export async function getHomepageData() {
  const [
    settings,
    stats,
    hero,
    featuredGallery,
    events,
    sponsors,
    notices,
    notes,
    publishedDonations,
  ] = await Promise.all([
    getAssociationSettings(),
    getPublicStats(),
    getHeroSection(),
    getFeaturedGallery(),
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
}

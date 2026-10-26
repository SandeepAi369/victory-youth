/**
 * Public Data Queries — Ganesh BNS / Victory Youth Association
 *
 * Gallery, banners and hero images live in the MEDIA database (getMediaDb);
 * everything else is in the CORE database (getDb).
 */

import { getDb, getMediaDb, schema } from "@/db";
import type { AssociationSettingsRow } from "@/db/schema";
import { eq, desc, and, ne, or, sql, type SQLWrapper } from "drizzle-orm";

const d = schema.donations;
const ctr = schema.contributors;

/**
 * A contribution is anonymous when its own flag OR its contributor's flag is
 * set (the two are kept in sync; checking both fails closed). Every donation
 * query below LEFT JOINs contributors so this can be evaluated.
 */
const isAnonymousContribution = sql`(coalesce(${d.isAnonymous}, 0) = 1 OR coalesce(${ctr.isAnonymous}, 0) = 1)`;

/**
 * Public donor name: anonymous donations are masked inside the SQL query, so
 * the real name never leaves the database for public pages.
 */
const publicDonorName = sql<string>`CASE WHEN ${isAnonymousContribution} THEN 'Anonymous Devotee' ELSE ${d.donorName} END`;

// ============================================
// YEAR-WISE VISIBILITY (admin setting public_years)
// ============================================

/** Years the admin made visible on the public site, or null for all years. */
export type PublicYears = number[] | null;

function parsePublicYears(value: unknown): PublicYears {
  if (!Array.isArray(value)) return null;
  const years = value.map(Number).filter((y) => Number.isInteger(y) && y >= 1900 && y <= 9999);
  return years.length > 0 ? years : null;
}

export async function getPublicYears(existingSettings?: AssociationSettingsRow | null): Promise<PublicYears> {
  const settings = existingSettings !== undefined ? existingSettings : await getAssociationSettings();
  return parsePublicYears(settings?.publicYears);
}

/** SQL condition "the year of this date column is one of the visible years" (undefined = no filter). */
function inPublicYears(dateExpr: SQLWrapper, years: PublicYears) {
  if (!years) return undefined;
  return sql`cast(substr(${dateExpr}, 1, 4) as integer) in (${sql.join(years.map((y) => sql`${y}`), sql`, `)})`;
}

/** A contribution's date; entries without one fall back to the day they were recorded. */
const contributionDate = sql`coalesce(${d.date}, date(${d.createdAt}, 'unixepoch'))`;

/**
 * Case-insensitive "contains" match for category search. User input is escaped,
 * so % and _ are matched literally.
 */
function contains(column: SQLWrapper, query: string) {
  const pattern = `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  return sql`${column} LIKE ${pattern} ESCAPE '\\'`;
}

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

async function getPublicStats(existingSettings?: AssociationSettingsRow | null, years: PublicYears = null) {
  try {
    const db = getDb();
    const settings = existingSettings !== undefined
      ? existingSettings
      : await getAssociationSettings();

    const [memberRows, totals, eventRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(schema.members).where(eq(schema.members.isActive, true)),
      getContributionTotals("ALL", years),
      db.select({ count: sql<number>`count(*)` })
        .from(schema.events).where(and(eq(schema.events.isPublished, true), inPublicYears(schema.events.date, years))),
    ]);

    return {
      totalMembers: Number(memberRows[0]?.count ?? 0),
      totalAmount: totals.grandTotal,
      anonymousAmount: totals.anonymousTotal,
      totalDonations: totals.totalCount,
      totalEvents: Number(eventRows[0]?.count ?? 0),
      donationTarget: Math.round(Number(settings?.donationTarget ?? 2500000)),
    };
  } catch (error) {
    console.error("❌ getPublicStats error:", error);
    return {
      totalMembers: 0, totalAmount: 0, anonymousAmount: 0, totalDonations: 0,
      totalEvents: 0, donationTarget: 2500000,
    };
  }
}

// ============================================
// EVENTS
// ============================================

export async function getPublishedEvents(search = "", years: PublicYears = null) {
  try {
    const db = getDb();
    const e = schema.events;
    return await db
      .select()
      .from(schema.events)
      .where(and(
        eq(schema.events.isPublished, true),
        inPublicYears(e.date, years),
        search ? or(contains(e.title, search), contains(e.description, search), contains(e.location, search), contains(e.type, search)) : undefined
      ))
      .orderBy(schema.events.day);
  } catch (error) {
    console.error("❌ getPublishedEvents error:", error);
    return [];
  }
}

// ============================================
// NOTICES
// ============================================

export async function getPublishedNotices(limit: number = 10, search = "") {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.notices)
      .where(and(
        eq(schema.notices.status, "PUBLISHED"),
        search ? or(contains(schema.notices.title, search), contains(schema.notices.body, search)) : undefined
      ))
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

export async function getPublishedNotes(limit: number = 10, search = "") {
  try {
    const db = getDb();
    const n = schema.importantNotes;
    return await db
      .select()
      .from(schema.importantNotes)
      .where(and(
        eq(schema.importantNotes.isPublished, true),
        search ? or(contains(n.title, search), contains(n.content, search), contains(n.category, search)) : undefined
      ))
      .orderBy(desc(schema.importantNotes.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedNotes error:", error);
    return [];
  }
}

// ============================================
// ACTIVE MEMBERS (public list — names only)
// ============================================

/** Names of active members an admin has published. Never returns any other column. */
export async function getPublicActiveMembers(search = "") {
  try {
    const db = getDb();
    const m = schema.members;
    return await db
      .select({ id: m.id, name: m.name })
      .from(m)
      .where(and(eq(m.isActive, true), eq(m.listedPublicly, true), search ? contains(m.name, search) : undefined))
      .orderBy(m.name);
  } catch (error) {
    console.error("❌ getPublicActiveMembers error:", error);
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

export type ContributionKind = "CHANDA" | "DONATIONS" | "ALL";

/** Published contributions of one kind (chanda vs. everything else) in the visible years. */
function publishedContributions(kind: ContributionKind, years: PublicYears) {
  return and(
    eq(d.isPublished, true),
    kind === "CHANDA" ? eq(d.category, "CHANDA") : kind === "DONATIONS" ? ne(d.category, "CHANDA") : undefined,
    inPublicYears(contributionDate, years),
  );
}

/**
 * Totals for a public page, split into named and anonymous contributions —
 * summed in SQL over ALL matching rows, not just the ones listed on the page.
 */
export async function getContributionTotals(kind: ContributionKind, years: PublicYears = null) {
  const empty = { publicTotal: 0, publicCount: 0, anonymousTotal: 0, anonymousCount: 0, grandTotal: 0, totalCount: 0 };
  try {
    const db = getDb();
    const [row] = await db
      .select({
        publicTotal: sql<number>`coalesce(sum(CASE WHEN ${isAnonymousContribution} THEN 0 ELSE ${d.amount} END), 0)`,
        publicCount: sql<number>`coalesce(sum(CASE WHEN ${isAnonymousContribution} THEN 0 ELSE 1 END), 0)`,
        anonymousTotal: sql<number>`coalesce(sum(CASE WHEN ${isAnonymousContribution} THEN ${d.amount} ELSE 0 END), 0)`,
        anonymousCount: sql<number>`coalesce(sum(CASE WHEN ${isAnonymousContribution} THEN 1 ELSE 0 END), 0)`,
      })
      .from(d)
      .leftJoin(ctr, eq(ctr.id, d.contributorId))
      .where(publishedContributions(kind, years));
    if (!row) return empty;
    const publicTotal = Math.round(Number(row.publicTotal)), anonymousTotal = Math.round(Number(row.anonymousTotal));
    const publicCount = Number(row.publicCount), anonymousCount = Number(row.anonymousCount);
    return { publicTotal, publicCount, anonymousTotal, anonymousCount, grandTotal: publicTotal + anonymousTotal, totalCount: publicCount + anonymousCount };
  } catch (error) {
    console.error("❌ getContributionTotals error:", error);
    return empty;
  }
}

export async function getPublishedDonations(limit = 20, search = "", years: PublicYears = null) {
  try {
    const db = getDb();
    return await db
      .select({
        donorName: publicDonorName,
        amount: d.amount,
        category: d.category,
        date: d.date,
      })
      .from(d)
      .leftJoin(ctr, eq(ctr.id, d.contributorId))
      .where(and(
        publishedContributions("DONATIONS", years),
        // Search the MASKED name, so an anonymous donor can never be found by their real name
        search ? or(contains(publicDonorName, search), contains(d.purpose, search), contains(d.category, search)) : undefined
      ))
      .orderBy(desc(d.createdAt))
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

export async function getPublishedChanda(limit = 100, search = "", years: PublicYears = null) {
  try {
    const db = getDb();
    // Only the columns the public chanda page shows — no phone, address or PAN
    return await db
      .select({
        id: d.id,
        donorName: publicDonorName,
        amount: d.amount,
        purpose: d.purpose,
        date: d.date,
      })
      .from(d)
      .leftJoin(ctr, eq(ctr.id, d.contributorId))
      .where(and(
        publishedContributions("CHANDA", years),
        search ? or(contains(publicDonorName, search), contains(d.purpose, search)) : undefined
      ))
      .orderBy(desc(d.createdAt))
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

export async function getHeroSection(existingSettings?: AssociationSettingsRow | null) {
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

export async function getFeaturedGallery(existingSettings?: AssociationSettingsRow | null) {
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
  } catch (error) {
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
    const years = await getPublicYears(settings);
    const [stats, hero, featuredGallery, events, notices, notes, publishedDonations, banners, heroImages] =
      await Promise.all([
        getPublicStats(settings, years),
        getHeroSection(settings),
        getFeaturedGallery(settings),
        getPublishedEvents("", years),
        getPublishedNotices(3),
        getPublishedNotes(5),
        getPublishedDonations(20, "", years),
        getPublishedBanners(),
      getHeroImages(),
      ]);
    return { settings, years, stats, hero, featuredGallery, events, notices, notes, publishedDonations, banners, heroImages };
  } catch (err) {
    console.error("❌ getHomepageData top-level error:", err);
    return {
      settings: null,
      years: null,
      stats: { totalDonations: 0, totalAmount: 0, anonymousAmount: 0, totalMembers: 0, totalEvents: 0, donationTarget: 2500000 },
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

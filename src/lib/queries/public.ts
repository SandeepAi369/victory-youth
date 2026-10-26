/**
 * Public Data Queries — Ganesh BNS / Victory Youth Association
 *
 * Gallery, banners and hero images live in the MEDIA database (getMediaDb);
 * everything else is in the CORE database (getDb).
 */

import { getDb, getMediaDb, schema } from "@/db";
import type { AssociationSettingsRow } from "@/db/schema";
import { eq, desc, and, ne, or, sql, type SQLWrapper } from "drizzle-orm";
import { currentYearIST } from "@/lib/contributions";

const d = schema.donations;
const ctr = schema.contributors;

/**
 * Anonymous entries are ADMIN-ONLY: public queries exclude them entirely (no
 * name, no amount, no label). An entry is anonymous when its own flag OR its
 * contributor's flag is set — both are checked, so it fails closed. Every
 * donation query below LEFT JOINs contributors so this can be evaluated.
 */
const isAnonymousContribution = sql`(coalesce(${d.isAnonymous}, 0) = 1 OR coalesce(${ctr.isAnonymous}, 0) = 1)`;

// ============================================
// YEAR-WISE VISIBILITY (admin setting public_years)
// ============================================

/** Years visible on the public site, or null for all years. */
export type PublicYears = number[] | null;

/** The admin's choice: a list of years, or "ALL"; anything else (not set yet) means the current year. */
function parsePublicYears(value: unknown): PublicYears {
  if (value === "ALL") return null;
  const years = Array.isArray(value) ? value.map(Number).filter((y) => Number.isInteger(y) && y >= 1900 && y <= 9999) : [];
  return years.length > 0 ? years : [currentYearIST()];
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

    const [memberRows, [donationTotals, chandaTotals], eventRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(schema.members).where(eq(schema.members.isActive, true)),
      // Kept apart: Chanda and Donations totals are never added together
      Promise.all([getContributionTotals("DONATIONS", years), getContributionTotals("CHANDA", years)]),
      db.select({ count: sql<number>`count(*)` })
        .from(schema.events).where(and(eq(schema.events.isPublished, true), inPublicYears(schema.events.date, years))),
    ]);

    return {
      totalMembers: Number(memberRows[0]?.count ?? 0),
      // Donation progress (vs. the donation target) counts Donations only
      totalAmount: donationTotals.total,
      totalDonations: donationTotals.count,
      chandaAmount: chandaTotals.total,
      totalEvents: Number(eventRows[0]?.count ?? 0),
      donationTarget: Math.round(Number(settings?.donationTarget ?? 2500000)),
    };
  } catch (error) {
    console.error("❌ getPublicStats error:", error);
    return {
      totalMembers: 0, totalAmount: 0, totalDonations: 0, chandaAmount: 0,
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
      .where(and(eq(m.isActive, true), eq(m.listedPublicly, true), eq(m.isAnonymous, false), search ? contains(m.name, search) : undefined))
      .orderBy(m.name);
  } catch (error) {
    console.error("❌ getPublicActiveMembers error:", error);
    return [];
  }
}

// ============================================
// COMMITTEE (members) — a money section: one row per member, payments itemized
// ============================================

/**
 * Public Committee list: ONE row per published, non-anonymous member with
 * their payment total and count. Never returns phone numbers or addresses.
 */
export async function getPublicCommittee(search = "") {
  try {
    const db = getDb();
    const m = schema.members, p = schema.memberPayments;
    return await db
      .select({
        id: m.id, name: sql<string>`trim(coalesce(${m.fullName}, ${m.name}))`, role: sql<string>`coalesce(${m.role}, ${m.committeeRole}, 'Member')`,
        total: sql<number>`coalesce(sum(${p.amount}), 0)`, count: sql<number>`count(${p.id})`, lastDate: sql<string | null>`max(${p.date})`,
      })
      .from(m)
      .leftJoin(p, eq(p.memberId, m.id))
      .where(and(eq(m.isActive, true), eq(m.isAnonymous, false),
        search ? or(contains(m.name, search), contains(m.fullName, search), contains(m.role, search), contains(m.committeeRole, search)) : undefined))
      .groupBy(m.id)
      .orderBy(sql`trim(coalesce(${m.fullName}, ${m.name}))`);
  } catch (error) {
    console.error("❌ getPublicCommittee error:", error);
    return [];
  }
}

/** One published, non-anonymous member's public page: name, role and itemized payments. */
export async function getPublicMember(id: string) {
  try {
    const db = getDb();
    const m = schema.members, p = schema.memberPayments;
    const [member] = await db
      .select({ name: sql<string>`trim(coalesce(${m.fullName}, ${m.name}))`, role: sql<string>`coalesce(${m.role}, ${m.committeeRole}, 'Member')` })
      .from(m).where(and(eq(m.id, id), eq(m.isActive, true), eq(m.isAnonymous, false))).limit(1);
    if (!member) return null;
    const payments = await db.select({ id: p.id, amount: p.amount, purpose: p.purpose, date: p.date })
      .from(p).where(eq(p.memberId, id)).orderBy(desc(p.date), desc(p.createdAt));
    return { ...member, payments, total: payments.reduce((s, x) => s + (Number(x.amount) || 0), 0) };
  } catch (error) {
    console.error("❌ getPublicMember error:", error);
    return null;
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

/** Chanda and Donations are independent: every public query covers exactly one of them, never both. */
export type ContributionKind = "CHANDA" | "DONATIONS";

/** Published, non-anonymous contributions of one kind (chanda vs. everything else) in the visible years. */
function publishedContributions(kind: ContributionKind, years: PublicYears) {
  return and(
    eq(d.isPublished, true),
    kind === "CHANDA" ? eq(d.category, "CHANDA") : ne(d.category, "CHANDA"),
    sql`NOT ${isAnonymousContribution}`,
    inPublicYears(contributionDate, years),
  );
}

/** Total of the published, non-anonymous contributions of one kind — summed in SQL over ALL matching rows. */
export async function getContributionTotals(kind: ContributionKind, years: PublicYears = null) {
  try {
    const db = getDb();
    const [row] = await db
      .select({ total: sql<number>`coalesce(sum(${d.amount}), 0)`, count: sql<number>`count(*)` })
      .from(d)
      .leftJoin(ctr, eq(ctr.id, d.contributorId))
      .where(publishedContributions(kind, years));
    return { total: Math.round(Number(row?.total ?? 0)), count: Number(row?.count ?? 0) };
  } catch (error) {
    console.error("❌ getContributionTotals error:", error);
    return { total: 0, count: 0 };
  }
}

/**
 * The public main list: ONE row per person (never one row per payment), with
 * their total, number of contributions and latest date in the visible years.
 * The itemized history is only on their profile page. Search matches the
 * name or any of the person's purposes; the row total still covers all of
 * their visible contributions.
 */
export async function getPublishedContributors(kind: ContributionKind, years: PublicYears = null, search = "", limit = 100) {
  try {
    const db = getDb();
    // Entries without a profile (very old data) stand on their own
    const person = sql<string>`coalesce(${d.contributorId}, ${d.id})`;
    return await db
      .select({
        key: person,
        contributorId: sql<string | null>`max(${d.contributorId})`,
        name: sql<string>`max(${d.donorName})`,
        total: sql<number>`coalesce(sum(${d.amount}), 0)`,
        count: sql<number>`count(*)`,
        lastDate: sql<string | null>`max(${d.date})`,
      })
      .from(d)
      .leftJoin(ctr, eq(ctr.id, d.contributorId))
      .where(publishedContributions(kind, years))
      .groupBy(person)
      .having(search ? or(contains(sql`max(${d.donorName})`, search), sql`max(CASE WHEN ${contains(d.purpose, search)} THEN 1 ELSE 0 END) = 1`) : undefined)
      .orderBy(sql`max(${d.createdAt}) DESC`)
      .limit(limit);
  } catch (error) {
    console.error("❌ getPublishedContributors error:", error);
    return [];
  }
}

/**
 * A named contributor's public profile: their complete, all-time history of
 * published, non-anonymous contributions IN THEIR PROFILE'S CATEGORY ONLY
 * (deliberately NOT limited to the public year selection). Returns null for an
 * anonymous (or unknown) contributor, so an anonymous person never has a page.
 */
export async function getPublicContributor(id: string) {
  try {
    const db = getDb();
    const [person] = await db.select({ name: ctr.name, category: ctr.category }).from(ctr)
      .where(and(eq(ctr.id, id), eq(ctr.isAnonymous, false))).limit(1);
    if (!person) return null;
    const kind: ContributionKind = person.category === "CHANDA" ? "CHANDA" : "DONATIONS";
    const contributions = await db
      .select({ id: d.id, amount: d.amount, category: d.category, purpose: d.purpose, date: d.date })
      .from(d)
      .leftJoin(ctr, eq(ctr.id, d.contributorId))
      .where(and(eq(d.contributorId, id), publishedContributions(kind, null)))
      .orderBy(desc(d.date), desc(d.createdAt));
    if (contributions.length === 0) return null;
    const total = contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    return { name: person.name, kind, contributions, total };
  } catch (error) {
    console.error("❌ getPublicContributor error:", error);
    return null;
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
        getPublishedContributors("DONATIONS", years, "", 6),
        getPublishedBanners(),
      getHeroImages(),
      ]);
    return { settings, years, stats, hero, featuredGallery, events, notices, notes, publishedDonations, banners, heroImages };
  } catch (err) {
    console.error("❌ getHomepageData top-level error:", err);
    return {
      settings: null,
      years: null,
      stats: { totalDonations: 0, totalAmount: 0, chandaAmount: 0, totalMembers: 0, totalEvents: 0, donationTarget: 2500000 },
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

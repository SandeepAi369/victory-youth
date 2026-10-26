"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { and, eq, ne, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { CONTRIBUTION_CATEGORIES, todayIST, type ContributionCategory } from "@/lib/contributions";

/**
 * Anonymous entries are an ADMIN-ONLY record: they are never published (marking
 * a profile anonymous unpublishes its entries, and they cannot be published
 * until it is unticked), and public queries exclude them entirely.
 *
 * Contributor profiles: one row per person PER CATEGORY (Chanda or Donations),
 * linked from every contribution they make in that category. Categories never
 * mix: a profile only ever holds contributions of its own category. A donation's donorName, phone and
 * isAnonymous are copies of its contributor's, kept in sync here, so receipts,
 * exports and public queries never see a stale name or anonymity flag.
 */

const c = schema.contributors;
const d = schema.donations;

function revalidate() {
  for (const path of ["/admin/chanda", "/admin/donations", "/chanda", "/donations", "/"]) revalidatePath(path);
}

function generateReceiptNo(): string {
  const year = new Date().getFullYear();
  const unique = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REC-${year}-${unique}`;
}

/** Rows that are not anonymous — the only ones that may ever be published. */
const notAnonymous = sql`coalesce(${d.isAnonymous}, 0) = 0`;

/** Donation rows of one category's book ("DONATION" also covers older SPONSORSHIP / OTHER rows). */
const inBook = (category: ContributionCategory) => (category === "CHANDA" ? eq(d.category, "CHANDA") : ne(d.category, "CHANDA"));

/**
 * Publishing is controlled by ONE button per section (the list's top
 * Publish/Unpublish). A section counts as "published" when it has named
 * entries and all of them are published; new or un-anonymised entries follow
 * that state, so the single button keeps the whole section consistent.
 */
async function sectionPublished(category: ContributionCategory) {
  const [row] = await getDb()
    .select({
      published: sql<number>`coalesce(sum(CASE WHEN ${d.isPublished} = 1 THEN 1 ELSE 0 END), 0)`,
      unpublished: sql<number>`coalesce(sum(CASE WHEN coalesce(${d.isPublished}, 0) = 0 THEN 1 ELSE 0 END), 0)`,
    })
    .from(d).where(and(inBook(category), notAnonymous));
  return Number(row?.published ?? 0) > 0 && Number(row?.unpublished ?? 0) === 0;
}

/** The contributors of one category with their number of contributions and total amount (admin only). */
export async function getContributors(category: ContributionCategory) {
  await requireAdmin();
  try {
    const db = getDb();
    return await db
      .select({
        id: c.id, name: c.name, phone: c.phone, category: c.category, isAnonymous: c.isAnonymous, notes: c.notes,
        count: sql<number>`count(${d.id})`,
        total: sql<number>`coalesce(sum(${d.amount}), 0)`,
        lastDate: sql<string | null>`max(${d.date})`,
      })
      .from(c)
      .leftJoin(d, eq(d.contributorId, c.id))
      .where(eq(c.category, category))
      .groupBy(c.id)
      .orderBy(c.name);
  } catch (error) {
    console.error("getContributors error:", error);
    return [];
  }
}

type NewContributor = { name: string; phone?: string; isAnonymous?: boolean };

export type ContributionInput = {
  /** An existing contributor of the same category, or `newContributor` to create one */
  contributorId?: string;
  newContributor?: NewContributor;
  /** Applied to the contributor (and so to all their contributions) when set */
  isAnonymous?: boolean;
  category: ContributionCategory;
  amount: number;
  paymentMode: string;
  purpose?: string;
};

function cleanContributor(data: NewContributor) {
  const name = data.name.trim().replace(/\s+/g, " ");
  if (!name) throw new Error("Contributor name is required");
  return { name, phone: data.phone?.trim() || null };
}

/** Resolves the contributor for a contribution: the chosen one, or a newly created one. */
async function resolveContributor(input: Pick<ContributionInput, "contributorId" | "newContributor" | "isAnonymous" | "category">) {
  const db = getDb();
  if (input.contributorId) {
    const [row] = await db.select().from(c).where(eq(c.id, input.contributorId)).limit(1);
    if (!row) throw new Error("Contributor not found");
    // Never attach a contribution to another category's profile
    if (row.category !== input.category) throw new Error("This contributor belongs to a different category");
    if (input.isAnonymous !== undefined && input.isAnonymous !== row.isAnonymous) {
      await applyAnonymous(row.id, input.isAnonymous);
      row.isAnonymous = input.isAnonymous;
    }
    return row;
  }
  if (!input.newContributor) throw new Error("Choose a contributor or add a new one");
  const { name, phone } = cleanContributor(input.newContributor);
  const row = { id: `ctr_${randomUUID()}`, name, phone, category: input.category, isAnonymous: !!(input.isAnonymous ?? input.newContributor.isAnonymous) };
  await db.insert(c).values(row);
  return row;
}

/** Validated non-amount fields of a contribution. */
function contributionFields(input: Pick<ContributionInput, "category" | "paymentMode" | "purpose">) {
  if (!CONTRIBUTION_CATEGORIES.includes(input.category)) throw new Error("Invalid category");
  const defaultPurpose = input.category === "CHANDA" ? "Monthly Chanda" : "General Donation";
  return { paymentMode: input.paymentMode, purpose: input.purpose?.trim() || defaultPurpose };
}

/** Adds a contribution to one category for an existing (same-category) or new contributor. */
export async function addContribution(input: ContributionInput) {
  await requireAdmin();
  try {
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Amount must be greater than 0");
    const fields = { ...contributionFields(input), amount: Math.round(input.amount) };
    const contributor = await resolveContributor(input);
    const receiptNo = generateReceiptNo();
    // Follows the section's single Publish/Unpublish state; anonymous entries are never published
    const isPublished = !contributor.isAnonymous && await sectionPublished(input.category);
    await getDb().insert(d).values({
      // The date is always set here (today, India time) — never taken from the browser
      id: `don_${randomUUID()}`, receiptNo, ...fields, category: input.category, date: todayIST(),
      contributorId: contributor.id, donorName: contributor.name, phone: contributor.phone ?? "",
      isAnonymous: contributor.isAnonymous, status: "SUCCESS", isPublished,
    });
    revalidate();
    return { success: true, receiptNo };
  } catch (error) {
    console.error("addContribution error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Edits a contribution. Amounts are never overwritten or merged: `addAmount`
 * (> 0) is recorded as a NEW, separate entry dated today (own receipt), so the
 * history stays itemized while the contributor's total sums up. The edited
 * entry keeps its amount, date and category; it can be moved to another (or a
 * new) contributor of the same category.
 */
export async function updateContribution(id: string, input: Omit<ContributionInput, "amount"> & { addAmount: number }) {
  await requireAdmin();
  try {
    if (!Number.isFinite(input.addAmount) || input.addAmount < 0) throw new Error("Amount to add must be 0 or more");
    const db = getDb();
    const [existing] = await db.select({ category: d.category, isPublished: d.isPublished })
      .from(d).where(and(eq(d.id, id), inBook(input.category))).limit(1);
    if (!existing) throw new Error("Contribution not found in this category");
    const fields = contributionFields(input);
    const contributor = await resolveContributor(input);
    const person = { contributorId: contributor.id, donorName: contributor.name, phone: contributor.phone ?? "", isAnonymous: contributor.isAnonymous };
    await db.update(d).set({
      ...fields, ...person,
      ...(contributor.isAnonymous ? { isPublished: false } : {}),
    }).where(eq(d.id, id));
    if (input.addAmount > 0) {
      await db.insert(d).values({
        id: `don_${randomUUID()}`, receiptNo: generateReceiptNo(), ...fields, ...person,
        category: existing.category ?? input.category, amount: Math.round(input.addAmount), date: todayIST(),
        // Same visibility as the entry it was added from — never public if anonymous
        isPublished: !!existing.isPublished && !contributor.isAnonymous, status: "SUCCESS",
      });
    }
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateContribution error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Sets the profile's anonymity on it and all its entries, atomically. Anonymous
 * entries are admin-only (unpublished); when unticked they follow the
 * section's Publish/Unpublish state.
 */
async function applyAnonymous(contributorId: string, anonymous: boolean) {
  const db = getDb();
  const [row] = await db.select({ category: c.category }).from(c).where(eq(c.id, contributorId)).limit(1);
  if (!row) throw new Error("Contributor not found");
  const publish = anonymous ? false : await sectionPublished(row.category === "CHANDA" ? "CHANDA" : "DONATION");
  await db.batch([
    db.update(c).set({ isAnonymous: anonymous, updatedAt: new Date() }).where(eq(c.id, contributorId)),
    db.update(d).set({ isAnonymous: anonymous, isPublished: publish }).where(eq(d.contributorId, contributorId)),
  ]);
}

/**
 * Edits a contributor profile; name, phone and the anonymous setting are copied
 * onto all of this profile's contributions (which are all in its own category).
 */
export async function updateContributor(id: string, data: { name: string; phone?: string; notes?: string; isAnonymous: boolean }) {
  await requireAdmin();
  try {
    const { name, phone } = cleanContributor(data);
    const db = getDb();
    const [before] = await db.select({ isAnonymous: c.isAnonymous }).from(c).where(eq(c.id, id)).limit(1);
    if (!before) throw new Error("Contributor not found");
    await db.batch([
      db.update(c).set({ name, phone, notes: data.notes?.trim() || null, updatedAt: new Date() }).where(eq(c.id, id)),
      db.update(d).set({ donorName: name, phone: phone ?? "" }).where(eq(d.contributorId, id)),
    ]);
    if (before.isAnonymous !== data.isAnonymous) await applyAnonymous(id, data.isAnonymous);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateContributor error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Deletes a contributor that has no contributions (delete or move those first). */
export async function deleteContributor(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(d).where(eq(d.contributorId, id));
    if (Number(n) > 0) throw new Error("This contributor still has contributions — delete or move them first");
    await db.delete(c).where(eq(c.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteContributor error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Publish or unpublish every NON-anonymous contribution of ONE category (anonymous entries are never touched). */
export async function setAllContributionsPublished(category: ContributionCategory, publish: boolean) {
  await requireAdmin();
  try {
    await getDb().update(d).set({ isPublished: publish }).where(and(inBook(category), notAnonymous));
    revalidate();
    return { success: true, newState: publish };
  } catch (error) {
    console.error("setAllContributionsPublished error:", error);
    return { success: false, newState: !publish, error: errorMessage(error) };
  }
}

/** Permanently deletes one contribution — only if it belongs to `category`. */
export async function deleteContribution(id: string, category: ContributionCategory) {
  await requireAdmin();
  try {
    const deleted = await getDb().delete(d).where(and(eq(d.id, id), inBook(category))).returning({ id: d.id });
    if (deleted.length === 0) throw new Error("Contribution not found in this category");
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteContribution error:", error);
    return { success: false, error: errorMessage(error) };
  }
}


/** One contributor profile and ALL of its entries (its own category only), for the admin profile page. */
export async function getContributorProfile(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    const [profile] = await db.select().from(c).where(eq(c.id, id)).limit(1);
    if (!profile) return null;
    const category: ContributionCategory = profile.category === "CHANDA" ? "CHANDA" : "DONATION";
    const entries = await db
      .select({
        id: d.id, receiptNo: d.receiptNo, donorName: d.donorName, phone: d.phone, amount: d.amount, category: d.category,
        purpose: d.purpose, paymentMode: d.paymentMode, date: d.date, isPublished: d.isPublished, isAnonymous: d.isAnonymous,
        contributorId: d.contributorId,
      })
      .from(d)
      .where(and(eq(d.contributorId, id), inBook(category)))
      .orderBy(desc(d.date), desc(d.createdAt));
    return { profile: { ...profile, category }, entries };
  } catch (error) {
    console.error("getContributorProfile error:", error);
    return null;
  }
}

/** The list tick: make a profile anonymous (its entries are unpublished — admin only) or public again. */
export async function setContributorAnonymous(contributorId: string, anonymous: boolean) {
  await requireAdmin();
  try {
    await applyAnonymous(contributorId, anonymous);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("setContributorAnonymous error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

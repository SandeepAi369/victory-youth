"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { CONTRIBUTION_CATEGORIES, todayIST, type ContributionCategory } from "@/lib/contributions";

/**
 * Contributor profiles: one row per person, linked from every donation /
 * chanda / sponsorship they make. A donation's donorName, phone and
 * isAnonymous are copies of its contributor's, kept in sync here, so receipts,
 * exports and public queries never see a stale name or anonymity flag.
 */

const c = schema.contributors;
const d = schema.donations;

function revalidate() {
  for (const path of ["/admin/contributors", "/admin/chanda", "/admin/donations", "/chanda", "/donations", "/"]) revalidatePath(path);
}

function generateReceiptNo(): string {
  const year = new Date().getFullYear();
  const unique = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REC-${year}-${unique}`;
}

/** Every contributor with their number of contributions and total amount (admin only). */
export async function getContributors() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db
      .select({
        id: c.id, name: c.name, phone: c.phone, isAnonymous: c.isAnonymous, notes: c.notes,
        count: sql<number>`count(${d.id})`,
        total: sql<number>`coalesce(sum(${d.amount}), 0)`,
        lastDate: sql<string | null>`max(${d.date})`,
      })
      .from(c)
      .leftJoin(d, eq(d.contributorId, c.id))
      .groupBy(c.id)
      .orderBy(c.name);
  } catch (error) {
    console.error("getContributors error:", error);
    return [];
  }
}

/** All contributions of one contributor, newest first (admin only). */
export async function getContributorHistory(contributorId: string) {
  await requireAdmin();
  try {
    const db = getDb();
    const rows = await db
      .select({ id: d.id, receiptNo: d.receiptNo, amount: d.amount, category: d.category, purpose: d.purpose, date: d.date, isPublished: d.isPublished })
      .from(d)
      .where(eq(d.contributorId, contributorId))
      .orderBy(desc(d.date), desc(d.createdAt));
    return { success: true, rows };
  } catch (error) {
    console.error("getContributorHistory error:", error);
    return { success: false, rows: [], error: errorMessage(error) };
  }
}

type NewContributor = { name: string; phone?: string; isAnonymous?: boolean };

export type ContributionInput = {
  /** An existing contributor, or `newContributor` to create one */
  contributorId?: string;
  newContributor?: NewContributor;
  /** Applied to the contributor (and so to all their contributions) when set */
  isAnonymous?: boolean;
  category: string;
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
async function resolveContributor(input: ContributionInput) {
  const db = getDb();
  if (input.contributorId) {
    const [row] = await db.select().from(c).where(eq(c.id, input.contributorId)).limit(1);
    if (!row) throw new Error("Contributor not found");
    if (input.isAnonymous !== undefined && input.isAnonymous !== row.isAnonymous) {
      await applyAnonymous(row.id, input.isAnonymous);
      row.isAnonymous = input.isAnonymous;
    }
    return row;
  }
  if (!input.newContributor) throw new Error("Choose a contributor or add a new one");
  const { name, phone } = cleanContributor(input.newContributor);
  const row = { id: `ctr_${randomUUID()}`, name, phone, isAnonymous: !!(input.isAnonymous ?? input.newContributor.isAnonymous) };
  await db.insert(c).values(row);
  return row;
}

function contributionFields(input: ContributionInput) {
  if (!CONTRIBUTION_CATEGORIES.includes(input.category as ContributionCategory)) throw new Error("Invalid category");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Amount must be greater than 0");
  const defaultPurpose = input.category === "CHANDA" ? "Monthly Chanda" : input.category === "SPONSORSHIP" ? "Sponsorship" : "General Donation";
  return {
    category: input.category, amount: Math.round(input.amount), paymentMode: input.paymentMode,
    purpose: input.purpose?.trim() || defaultPurpose,
  };
}

/** Adds a contribution (chanda, donation, sponsorship…) for an existing or new contributor. */
export async function addContribution(input: ContributionInput) {
  await requireAdmin();
  try {
    const fields = contributionFields(input);
    const contributor = await resolveContributor(input);
    const receiptNo = generateReceiptNo();
    await getDb().insert(d).values({
      // The date is always set here (today, India time) — never taken from the browser
      id: `don_${randomUUID()}`, receiptNo, ...fields, date: todayIST(),
      contributorId: contributor.id, donorName: contributor.name, phone: contributor.phone ?? "",
      isAnonymous: contributor.isAnonymous, status: "SUCCESS", isPublished: false,
    });
    revalidate();
    return { success: true, receiptNo };
  } catch (error) {
    console.error("addContribution error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Edits a contribution (its original date is kept); it can also be moved to another (or a new) contributor. */
export async function updateContribution(id: string, input: ContributionInput) {
  await requireAdmin();
  try {
    const fields = contributionFields(input);
    const contributor = await resolveContributor(input);
    await getDb().update(d).set({
      ...fields, contributorId: contributor.id, donorName: contributor.name,
      phone: contributor.phone ?? "", isAnonymous: contributor.isAnonymous,
    }).where(eq(d.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateContribution error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Sets the contributor's anonymity and copies it onto all their contributions, atomically. */
async function applyAnonymous(contributorId: string, anonymous: boolean) {
  const db = getDb();
  await db.batch([
    db.update(c).set({ isAnonymous: anonymous, updatedAt: new Date() }).where(eq(c.id, contributorId)),
    db.update(d).set({ isAnonymous: anonymous }).where(eq(d.contributorId, contributorId)),
  ]);
}

/** Hide (true) or show (false) this person's name on ALL their contributions, past and future. */
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

export async function createContributor(data: NewContributor & { notes?: string }) {
  await requireAdmin();
  try {
    const { name, phone } = cleanContributor(data);
    const id = `ctr_${randomUUID()}`;
    await getDb().insert(c).values({ id, name, phone, isAnonymous: !!data.isAnonymous, notes: data.notes?.trim() || null });
    revalidate();
    return { success: true, id };
  } catch (error) {
    console.error("createContributor error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Renames / edits a contributor; the name and phone are copied onto all their contributions. */
export async function updateContributor(id: string, data: { name: string; phone?: string; notes?: string }) {
  await requireAdmin();
  try {
    const { name, phone } = cleanContributor(data);
    const db = getDb();
    await db.batch([
      db.update(c).set({ name, phone, notes: data.notes?.trim() || null, updatedAt: new Date() }).where(eq(c.id, id)),
      db.update(d).set({ donorName: name, phone: phone ?? "" }).where(eq(d.contributorId, id)),
    ]);
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

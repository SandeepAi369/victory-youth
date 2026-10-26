"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { todayIST } from "@/lib/contributions";

/**
 * Members (the public "Committee") — a money section like Chanda/Donations:
 * every payment of a member is its own entry (member_payments, never merged
 * or overwritten); members.membership_fee is kept equal to their sum.
 * Publishing is ONE switch for the whole section (members.is_active, the top
 * button); anonymous members are admin-only and never shown publicly.
 */

const m = schema.members;
const p = schema.memberPayments;

function revalidate() {
  for (const path of ["/admin/members", "/admin/active-members", "/active-members", "/members", "/"]) revalidatePath(path);
}

const notAnonymous = sql`coalesce(${m.isAnonymous}, 0) = 0`;

function receiptNo() {
  return `MEM-${new Date().getFullYear()}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/** The section counts as "published" when it has named members and all of them are visible. */
async function sectionPublished() {
  const [row] = await getDb()
    .select({
      on: sql<number>`coalesce(sum(CASE WHEN ${m.isActive} = 1 THEN 1 ELSE 0 END), 0)`,
      off: sql<number>`coalesce(sum(CASE WHEN coalesce(${m.isActive}, 0) = 0 THEN 1 ELSE 0 END), 0)`,
    })
    .from(m).where(notAnonymous);
  return Number(row?.on ?? 0) > 0 && Number(row?.off ?? 0) === 0;
}

/** Keeps members.membership_fee equal to the sum of the member's payments. */
function syncFee(memberId: string) {
  return getDb().update(m)
    .set({ membershipFee: sql`(SELECT coalesce(sum(${p.amount}), 0) FROM ${p} WHERE ${p.memberId} = ${memberId})`, updatedAt: new Date() })
    .where(eq(m.id, memberId));
}

/** All members (one row each) with their payment total, count and last payment date. */
export async function getMembers() {
  await requireAdmin();
  try {
    return await getDb()
      .select({
        id: m.id, memberId: m.memberId, name: m.name, fullName: m.fullName, phone: m.phone,
        role: m.role, committeeRole: m.committeeRole, isActive: m.isActive, isAnonymous: m.isAnonymous,
        joinDate: m.joinDate, createdAt: m.createdAt,
        total: sql<number>`coalesce(sum(${p.amount}), 0)`,
        count: sql<number>`count(${p.id})`,
        lastDate: sql<string | null>`max(${p.date})`,
      })
      .from(m)
      .leftJoin(p, eq(p.memberId, m.id))
      .groupBy(m.id)
      .orderBy(m.name);
  } catch (error) {
    console.error("getMembers error:", error);
    return [];
  }
}

/** One member and all of their payments (newest first), for the member's admin page. */
export async function getMemberProfile(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    const [member] = await db.select().from(m).where(eq(m.id, id)).limit(1);
    if (!member) return null;
    const payments = await db.select().from(p).where(eq(p.memberId, id)).orderBy(desc(p.date), desc(p.createdAt));
    return { member, payments };
  } catch (error) {
    console.error("getMemberProfile error:", error);
    return null;
  }
}

type MemberFields = { fullName: string; phone: string; role?: string };

function cleanMember(data: MemberFields) {
  const fullName = data.fullName.trim().replace(/\s+/g, " ");
  if (!fullName) throw new Error("Name is required");
  if (!data.phone.trim()) throw new Error("Phone is required");
  return { name: fullName, fullName, phone: data.phone.trim(), role: data.role || "Member", committeeRole: data.role || "Member" };
}

/** Adds a member; their first amount (if any) becomes their first payment, dated today. */
export async function addMember(data: MemberFields & { amount: number; paymentMode?: string }) {
  await requireAdmin();
  try {
    const db = getDb();
    const id = `mem_${randomUUID()}`;
    const memberId = `VY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const amount = Math.max(0, Math.round(Number(data.amount) || 0));
    await db.insert(m).values({
      id, memberId, ...cleanMember(data),
      membershipFee: amount,
      joinDate: todayIST(),
      // Follows the section's single Publish/Unpublish state
      isActive: await sectionPublished(),
    });
    if (amount > 0) {
      await db.insert(p).values({ id: `mpay_${randomUUID()}`, memberId: id, receiptNo: receiptNo(), amount, paymentMode: data.paymentMode || "CASH", date: todayIST() });
    }
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("addMember error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Edits a member's details and anonymity. Amounts are never edited here — payments are added as new entries. */
export async function updateMember(id: string, data: MemberFields & { isAnonymous: boolean }) {
  await requireAdmin();
  try {
    const db = getDb();
    const [before] = await db.select({ isAnonymous: m.isAnonymous }).from(m).where(eq(m.id, id)).limit(1);
    if (!before) throw new Error("Member not found");
    await db.update(m).set({ ...cleanMember(data), updatedAt: new Date() }).where(eq(m.id, id));
    if (before.isAnonymous !== data.isAnonymous) await applyAnonymous(id, data.isAnonymous);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateMember error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Anonymous members are hidden (admin only); when unticked they follow the section's state. */
async function applyAnonymous(id: string, anonymous: boolean) {
  const isActive = anonymous ? false : await sectionPublished();
  await getDb().update(m).set({ isAnonymous: anonymous, isActive, updatedAt: new Date() }).where(eq(m.id, id));
}

/** The list tick: make a member anonymous (hidden from the public site) or public again. */
export async function setMemberAnonymous(id: string, anonymous: boolean) {
  await requireAdmin();
  try {
    await applyAnonymous(id, anonymous);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("setMemberAnonymous error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Records a NEW payment for a member (dated today) — never merged into an earlier one. */
export async function addMemberPayment(memberId: string, data: { amount: number; paymentMode?: string; purpose?: string }) {
  await requireAdmin();
  try {
    const amount = Math.round(Number(data.amount) || 0);
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    const db = getDb();
    await db.batch([
      db.insert(p).values({
        id: `mpay_${randomUUID()}`, memberId, receiptNo: receiptNo(), amount,
        paymentMode: data.paymentMode || "CASH", purpose: data.purpose?.trim() || "Membership", date: todayIST(),
      }),
      syncFee(memberId),
    ]);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("addMemberPayment error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Edits a payment's mode/purpose (its amount and date are kept). */
export async function updateMemberPayment(paymentId: string, data: { paymentMode?: string; purpose?: string }) {
  await requireAdmin();
  try {
    await getDb().update(p).set({ paymentMode: data.paymentMode || "CASH", purpose: data.purpose?.trim() || "Membership" }).where(eq(p.id, paymentId));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateMemberPayment error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteMemberPayment(paymentId: string) {
  await requireAdmin();
  try {
    const db = getDb();
    const [row] = await db.select({ memberId: p.memberId }).from(p).where(eq(p.id, paymentId)).limit(1);
    if (!row) throw new Error("Payment not found");
    await db.batch([db.delete(p).where(eq(p.id, paymentId)), syncFee(row.memberId)]);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteMemberPayment error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteMember(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.batch([db.delete(p).where(eq(p.memberId, id)), db.delete(m).where(eq(m.id, id))]);
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteMember error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** The section's ONE Publish/Unpublish: every NON-anonymous member (anonymous members are never shown). */
export async function setAllMembersVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    await getDb().update(m).set({ isActive: publish }).where(notAnonymous);
    revalidate();
    return { success: true, newState: publish };
  } catch (error) {
    console.error("setAllMembersVisibility error:", error);
    return { success: false, newState: !publish, error: errorMessage(error) };
  }
}

/** Names of active members only (plus whether each is published on the public list). */
export async function getActiveMemberNames() {
  await requireAdmin();
  try {
    return await getDb()
      .select({ id: m.id, name: m.name, listedPublicly: m.listedPublicly })
      .from(m)
      .where(and(eq(m.isActive, true), notAnonymous))
      .orderBy(m.name);
  } catch (error) {
    console.error("getActiveMemberNames error:", error);
    return [];
  }
}

/** Publish (true) or hide (false) a member's name on the public Active Members list. */
export async function toggleMemberListing(id: string, listed: boolean) {
  await requireAdmin();
  try {
    await getDb().update(m).set({ listedPublicly: listed }).where(eq(m.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("toggleMemberListing error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Admin ledger figures, ONE money section at a time (Chanda, Donations,
 * Members). They are independent books, so nothing here ever adds them together.
 * (Admin pages only — they are protected by the admin layout / middleware.)
 */
import { getDb, schema } from "@/db";
import { eq, ne, sql } from "drizzle-orm";
import type { ContributionCategory } from "@/lib/contributions";

const d = schema.donations;

export type CategoryLedger = {
  total: number; count: number;
  publishedTotal: number; publishedCount: number;
  byPaymentMode: { mode: string; total: number; count: number }[];
};

export async function getCategoryLedger(category: ContributionCategory): Promise<CategoryLedger> {
  const empty = { total: 0, count: 0, publishedTotal: 0, publishedCount: 0, byPaymentMode: [] };
  try {
    const db = getDb();
    const inBook = category === "CHANDA" ? eq(d.category, "CHANDA") : ne(d.category, "CHANDA");
    const [[row], modes] = await Promise.all([
      db.select({
        total: sql<number>`coalesce(sum(${d.amount}), 0)`,
        count: sql<number>`count(*)`,
        publishedTotal: sql<number>`coalesce(sum(CASE WHEN ${d.isPublished} = 1 THEN ${d.amount} ELSE 0 END), 0)`,
        publishedCount: sql<number>`coalesce(sum(CASE WHEN ${d.isPublished} = 1 THEN 1 ELSE 0 END), 0)`,
      }).from(d).where(inBook),
      db.select({ mode: d.paymentMode, total: sql<number>`coalesce(sum(${d.amount}), 0)`, count: sql<number>`count(*)` })
        .from(d).where(inBook).groupBy(d.paymentMode),
    ]);
    return {
      total: Number(row?.total ?? 0), count: Number(row?.count ?? 0),
      publishedTotal: Number(row?.publishedTotal ?? 0), publishedCount: Number(row?.publishedCount ?? 0),
      byPaymentMode: modes.map((m) => ({ mode: (m.mode || "OTHER").replace("_", " "), total: Number(m.total), count: Number(m.count) })),
    };
  } catch (error) {
    console.error("getCategoryLedger error:", error);
    return empty;
  }
}

/** Expenses (Money Out), a separate ledger. */
export async function getExpenseLedger() {
  try {
    const db = getDb();
    const t = schema.transactions;
    const rows = await db.select({ category: t.category, total: sql<number>`coalesce(sum(${t.amount}), 0)`, count: sql<number>`count(*)` })
      .from(t).where(eq(t.type, "EXPENSE")).groupBy(t.category);
    const byCategory = rows.map((r) => ({ category: r.category || "GENERAL", total: Number(r.total), count: Number(r.count) }));
    return { total: byCategory.reduce((s, r) => s + r.total, 0), byCategory };
  } catch (error) {
    console.error("getExpenseLedger error:", error);
    return { total: 0, byCategory: [] };
  }
}

/** Members (Committee) ledger: all member payments; "published" = payments of visible, non-anonymous members. */
export async function getMemberLedger(): Promise<CategoryLedger> {
  const empty = { total: 0, count: 0, publishedTotal: 0, publishedCount: 0, byPaymentMode: [] };
  try {
    const db = getDb();
    const p = schema.memberPayments, m = schema.members;
    const visible = sql`${m.isActive} = 1 AND coalesce(${m.isAnonymous}, 0) = 0`;
    const [[row], modes] = await Promise.all([
      db.select({
        total: sql<number>`coalesce(sum(${p.amount}), 0)`,
        count: sql<number>`count(*)`,
        publishedTotal: sql<number>`coalesce(sum(CASE WHEN ${visible} THEN ${p.amount} ELSE 0 END), 0)`,
        publishedCount: sql<number>`coalesce(sum(CASE WHEN ${visible} THEN 1 ELSE 0 END), 0)`,
      }).from(p).innerJoin(m, eq(m.id, p.memberId)),
      db.select({ mode: p.paymentMode, total: sql<number>`coalesce(sum(${p.amount}), 0)`, count: sql<number>`count(*)` }).from(p).groupBy(p.paymentMode),
    ]);
    return {
      total: Number(row?.total ?? 0), count: Number(row?.count ?? 0),
      publishedTotal: Number(row?.publishedTotal ?? 0), publishedCount: Number(row?.publishedCount ?? 0),
      byPaymentMode: modes.map((x) => ({ mode: (x.mode || "OTHER").replace("_", " "), total: Number(x.total), count: Number(x.count) })),
    };
  } catch (error) {
    console.error("getMemberLedger error:", error);
    return empty;
  }
}

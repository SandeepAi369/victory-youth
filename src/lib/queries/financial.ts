/**
 * Financial Queries for Ganesh BNS
 * 
 * These queries handle all financial calculations for:
 * - Master Summary/Ledger
 * - Individual table totals
 * - Financial reporting
 */

import { db, schema } from "@/db";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export interface FinancialSummary {
  donations: {
    count: number;
    totalAmount: number;
    byPaymentMode: Record<string, { count: number; total: number }>;
    byPurpose: Record<string, { count: number; total: number }>;
  };
  expenses: {
    count: number;
    totalAmount: number;
    totalApproved: number;
    totalPending: number;
    totalPaid: number;
    byCategory: Record<string, { count: number; total: number }>;
  };
  sponsors: {
    count: number;
    totalAmount: number;
    byTier: Record<string, { count: number; total: number }>;
  };
  auction: {
    itemCount: number;
    totalBids: number;
    totalRevenue: number;
    soldItems: number;
  };
  netBalance: number;
}

// ============================================
// DONATION QUERIES
// ============================================

/**
 * Get total donations summary
 */
export async function getDonationsSummary() {
  if (!db) {
    return {
      count: 0,
      totalAmount: 0,
      byPaymentMode: {},
      byPurpose: {},
    };
  }

  try {
    // Total donations
    const totalResult = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, "SUCCESS"));

    // By payment mode
    const byModeResult = await db
      .select({
        mode: schema.donations.paymentMode,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, "SUCCESS"))
      .groupBy(schema.donations.paymentMode);

    // By purpose
    const byPurposeResult = await db
      .select({
        purpose: schema.donations.purpose,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, "SUCCESS"))
      .groupBy(schema.donations.purpose);

    const byPaymentMode: Record<string, { count: number; total: number }> = {};
    byModeResult.forEach((item) => {
      if (item.mode) {
        byPaymentMode[item.mode] = {
          count: item.count,
          total: item.total,
        };
      }
    });

    const byPurpose: Record<string, { count: number; total: number }> = {};
    byPurposeResult.forEach((item) => {
      if (item.purpose) {
        byPurpose[item.purpose] = {
          count: item.count,
          total: item.total,
        };
      }
    });

    return {
      count: totalResult[0]?.count || 0,
      totalAmount: totalResult[0]?.total || 0,
      byPaymentMode,
      byPurpose,
    };
  } catch (error) {
    console.error("Error fetching donations summary:", error);
    return {
      count: 0,
      totalAmount: 0,
      byPaymentMode: {},
      byPurpose: {},
    };
  }
}

/**
 * Get donations by date range
 */
export async function getDonationsByDateRange(startDate: string, endDate: string) {
  if (!db) return [];

  try {
    const donations = await db
      .select()
      .from(schema.donations)
      .where(
        and(
          eq(schema.donations.status, "SUCCESS"),
          gte(schema.donations.date, startDate),
          lte(schema.donations.date, endDate)
        )
      )
      .orderBy(desc(schema.donations.date));

    return donations;
  } catch (error) {
    console.error("Error fetching donations by date range:", error);
    return [];
  }
}

// ============================================
// EXPENSE QUERIES
// ============================================

/**
 * Get total expenses summary
 */
export async function getExpensesSummary() {
  if (!db) {
    return {
      count: 0,
      totalAmount: 0,
      totalApproved: 0,
      totalPending: 0,
      totalPaid: 0,
      byCategory: {},
    };
  }

  try {
    // Total expenses
    const totalResult = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
        approved: sql<number>`coalesce(sum(case when status = 'APPROVED' then amount else 0 end), 0)::int`,
        pending: sql<number>`coalesce(sum(case when status = 'PENDING' then amount else 0 end), 0)::int`,
        paid: sql<number>`coalesce(sum(case when status = 'PAID' then amount else 0 end), 0)::int`,
      })
      .from(schema.expenses);

    // By category
    const byCategoryResult = await db
      .select({
        categoryId: schema.expenses.categoryId,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.expenses)
      .groupBy(schema.expenses.categoryId);

    const byCategory: Record<string, { count: number; total: number }> = {};
    byCategoryResult.forEach((item) => {
      if (item.categoryId) {
        byCategory[item.categoryId] = {
          count: item.count,
          total: item.total,
        };
      }
    });

    return {
      count: totalResult[0]?.count || 0,
      totalAmount: totalResult[0]?.total || 0,
      totalApproved: totalResult[0]?.approved || 0,
      totalPending: totalResult[0]?.pending || 0,
      totalPaid: totalResult[0]?.paid || 0,
      byCategory,
    };
  } catch (error) {
    console.error("Error fetching expenses summary:", error);
    return {
      count: 0,
      totalAmount: 0,
      totalApproved: 0,
      totalPending: 0,
      totalPaid: 0,
      byCategory: {},
    };
  }
}

// ============================================
// SPONSOR QUERIES
// ============================================

/**
 * Get total sponsors summary
 */
export async function getSponsorsSummary() {
  if (!db) {
    return {
      count: 0,
      totalAmount: 0,
      byTier: {},
    };
  }

  try {
    // Total sponsors
    const totalResult = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.sponsors)
      .where(eq(schema.sponsors.isPublished, true));

    // By tier
    const byTierResult = await db
      .select({
        tier: schema.sponsors.tier,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::int`,
      })
      .from(schema.sponsors)
      .where(eq(schema.sponsors.isPublished, true))
      .groupBy(schema.sponsors.tier);

    const byTier: Record<string, { count: number; total: number }> = {};
    byTierResult.forEach((item) => {
      if (item.tier) {
        byTier[item.tier] = {
          count: item.count,
          total: item.total,
        };
      }
    });

    return {
      count: totalResult[0]?.count || 0,
      totalAmount: totalResult[0]?.total || 0,
      byTier,
    };
  } catch (error) {
    console.error("Error fetching sponsors summary:", error);
    return {
      count: 0,
      totalAmount: 0,
      byTier: {},
    };
  }
}

// ============================================
// AUCTION QUERIES
// ============================================

/**
 * Get auction summary
 */
export async function getAuctionSummary() {
  if (!db) {
    return {
      itemCount: 0,
      totalBids: 0,
      totalRevenue: 0,
      soldItems: 0,
    };
  }

  try {
    // Item count
    const itemsResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.auctionItems);

    // Total bids
    const bidsResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.auctionBids);

    // Sold items and revenue
    const soldResult = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(current_bid), 0)::int`,
      })
      .from(schema.auctionItems)
      .where(eq(schema.auctionItems.status, "CLOSED"));

    return {
      itemCount: itemsResult[0]?.count || 0,
      totalBids: bidsResult[0]?.count || 0,
      totalRevenue: soldResult[0]?.total || 0,
      soldItems: soldResult[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching auction summary:", error);
    return {
      itemCount: 0,
      totalBids: 0,
      totalRevenue: 0,
      soldItems: 0,
    };
  }
}

// ============================================
// MASTER SUMMARY
// ============================================

/**
 * Get complete financial summary for Master Summary/Ledger
 * This is the main function that aggregates all financial data
 */
export async function getMasterFinancialSummary(): Promise<FinancialSummary> {
  const [donations, expenses, sponsors, auction] = await Promise.all([
    getDonationsSummary(),
    getExpensesSummary(),
    getSponsorsSummary(),
    getAuctionSummary(),
  ]);

  const totalIncome = donations.totalAmount + sponsors.totalAmount + auction.totalRevenue;
  const totalExpenses = expenses.totalPaid;
  const netBalance = totalIncome - totalExpenses;

  return {
    donations,
    expenses,
    sponsors,
    auction,
    netBalance,
  };
}

/**
 * Get formatted financial summary for display
 */
export async function getFormattedFinancialSummary() {
  const summary = await getMasterFinancialSummary();

  return {
    sections: [
      {
        title: "Donations",
        icon: "Heart",
        total: summary.donations.totalAmount,
        count: summary.donations.count,
        color: "text-green-600",
        bgColor: "bg-green-50",
        breakdown: Object.entries(summary.donations.byPaymentMode).map(([mode, data]) => ({
          label: mode,
          amount: data.total,
          count: data.count,
        })),
      },
      {
        title: "Sponsors",
        icon: "Award",
        total: summary.sponsors.totalAmount,
        count: summary.sponsors.count,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        breakdown: Object.entries(summary.sponsors.byTier).map(([tier, data]) => ({
          label: tier,
          amount: data.total,
          count: data.count,
        })),
      },
      {
        title: "Auction Revenue",
        icon: "Gavel",
        total: summary.auction.totalRevenue,
        count: summary.auction.soldItems,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        breakdown: [
          { label: "Total Items", amount: summary.auction.itemCount, count: summary.auction.itemCount },
          { label: "Total Bids", amount: summary.auction.totalBids, count: summary.auction.totalBids },
        ],
      },
      {
        title: "Expenses",
        icon: "Receipt",
        total: summary.expenses.totalAmount,
        count: summary.expenses.count,
        color: "text-red-600",
        bgColor: "bg-red-50",
        breakdown: [
          { label: "Paid", amount: summary.expenses.totalPaid, count: 0 },
          { label: "Pending", amount: summary.expenses.totalPending, count: 0 },
          { label: "Approved", amount: summary.expenses.totalApproved, count: 0 },
        ],
      },
    ],
    totals: {
      totalIncome: summary.donations.totalAmount + summary.sponsors.totalAmount + summary.auction.totalRevenue,
      totalExpenses: summary.expenses.totalPaid,
      netBalance: summary.netBalance,
    },
  };
}

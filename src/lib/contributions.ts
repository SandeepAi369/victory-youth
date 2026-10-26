/**
 * Shared by the contributor server actions and the admin contribution forms.
 * The two categories are fully independent books: separate profiles, history,
 * anonymity, totals and search.
 */
export const CONTRIBUTION_CATEGORIES = ["CHANDA", "DONATION"] as const;
export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number];

/** The book a donation row belongs to (older rows may carry SPONSORSHIP / OTHER — those are Donations). */
export const bookOf = (category: string | null | undefined): ContributionCategory => (category === "CHANDA" ? "CHANDA" : "DONATION");

export const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];

/** Today's date (YYYY-MM-DD) in India — contributions are always recorded on this date. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** The current year in India. */
export const currentYearIST = () => Number(todayIST().slice(0, 4));

/** Human label for the public year selection: null → "All Years", [2025, 2026] → "2025 & 2026". */
export function describeYears(years: number[] | null): string {
  if (!years || years.length === 0) return "All Years";
  const sorted = [...years].sort((a, b) => a - b).map(String);
  return sorted.length === 1 ? sorted[0] : `${sorted.slice(0, -1).join(", ")} & ${sorted.at(-1)}`;
}

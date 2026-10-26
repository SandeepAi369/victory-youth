/** Shared by the contributor server actions and the admin contribution forms. */
export const CONTRIBUTION_CATEGORIES = ["CHANDA", "DONATION", "SPONSORSHIP", "OTHER"] as const;
export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number];

export const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];

/** Today's date (YYYY-MM-DD) in India — contributions are always recorded on this date. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** The current year in India. */
export const currentYearIST = () => Number(todayIST().slice(0, 4));

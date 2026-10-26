/** Shared by the contributor server actions and the admin contribution forms. */
export const CONTRIBUTION_CATEGORIES = ["CHANDA", "DONATION", "SPONSORSHIP", "OTHER"] as const;
export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number];

export const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];

import { CalendarDays, Info } from "lucide-react";
import type { getContributionTotals, PublicYears } from "@/lib/queries/public";
import { describeYears } from "@/lib/contributions";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const plural = (n: number) => `${n} contribution${n === 1 ? "" : "s"}`;

/** "Total for 2026" pill + one-line explanation, driven by the admin's year selection. */
export function YearScope({ years, tone = "light" }: { years: PublicYears; tone?: "light" | "card" }) {
  const label = describeYears(years);
  const pill = tone === "light"
    ? "bg-white/20 ring-1 ring-white/40 text-white"
    : "bg-orange-50 ring-1 ring-orange-200 text-orange-700 dark:bg-orange-950/40 dark:ring-orange-800 dark:text-orange-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${pill}`}>
      <CalendarDays className="w-3.5 h-3.5" aria-hidden /> {years ? `Total for ${label}` : "All Years"}
    </span>
  );
}

/** Explains what the totals cover, so readers never mistake a yearly total for an all-time one. */
export function yearScopeNote(years: PublicYears) {
  return years
    ? `This total is for ${describeYears(years)} only. Tap a name to see their all-time history.`
    : "This total covers contributions from all years.";
}

/** The page's total for the selected year(s) — published entries only. */
export function ContributionTotals({ label, totals, years, gradient }: {
  label: string;
  totals: Awaited<ReturnType<typeof getContributionTotals>>;
  years: PublicYears;
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 mb-8 text-white shadow-lg`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="text-3xl font-black mt-1">{inr(totals.total)}</p>
          <p className="text-sm text-white/70 mt-1">{plural(totals.count)}</p>
        </div>
        <YearScope years={years} />
      </div>
      <p className="mt-4 pt-3 border-t border-white/20 text-xs text-white/85 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden /> {yearScopeNote(years)}
      </p>
    </div>
  );
}

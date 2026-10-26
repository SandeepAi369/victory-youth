import { Users, UserX, CalendarDays } from "lucide-react";
import type { getContributionTotals, PublicYears } from "@/lib/queries/public";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const plural = (n: number) => `${n} contribution${n === 1 ? "" : "s"}`;

/** Grand total with the named / anonymous split side by side (public pages). */
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
          <p className="text-sm font-medium text-white/80">{label} — Grand Total</p>
          <p className="text-3xl font-black mt-1">{inr(totals.grandTotal)}</p>
          <p className="text-sm text-white/70 mt-1">{plural(totals.totalCount)}</p>
        </div>
        {years && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <CalendarDays className="w-3.5 h-3.5" /> {years.join(", ")}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-xs font-medium text-white/80 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Public Contributions</p>
          <p className="text-xl font-black mt-0.5">{inr(totals.publicTotal)}</p>
          <p className="text-[11px] text-white/70">{plural(totals.publicCount)}</p>
        </div>
        <div className="rounded-xl bg-black/15 p-3">
          <p className="text-xs font-medium text-white/80 flex items-center gap-1"><UserX className="w-3.5 h-3.5" /> Anonymous Contributions</p>
          <p className="text-xl font-black mt-0.5">{inr(totals.anonymousTotal)}</p>
          <p className="text-[11px] text-white/70">{plural(totals.anonymousCount)}</p>
        </div>
      </div>
    </div>
  );
}

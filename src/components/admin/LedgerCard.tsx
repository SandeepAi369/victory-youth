import Link from "next/link";
import type { CategoryLedger } from "@/lib/queries/ledger";

const fmt = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/** One category's book (Chanda OR Donations) — never combined with the other. */
export function LedgerCard({ title, href, ledger, tone, detailed = false }: {
  title: string; href: string; ledger: CategoryLedger; tone: "amber" | "emerald"; detailed?: boolean;
}) {
  const colors = tone === "amber"
    ? "border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300"
    : "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300";
  return (
    <div className={`p-5 rounded-xl border ${colors}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        <Link href={href} className="text-xs font-bold hover:underline">Open →</Link>
      </div>
      <p className="text-3xl font-black mt-1">{fmt(ledger.total)}</p>
      <p className="text-xs opacity-80">{ledger.count} entries · {fmt(ledger.publishedTotal)} published ({ledger.publishedCount}) · {fmt(ledger.total - ledger.publishedTotal)} unpublished ({ledger.count - ledger.publishedCount})</p>
      {detailed && ledger.byPaymentMode.length > 0 && (
        <ul className="mt-4 pt-3 border-t border-current/20 space-y-1.5 text-sm text-foreground">
          {ledger.byPaymentMode.map((m) => (
            <li key={m.mode} className="flex justify-between"><span>{m.mode} <span className="text-xs text-muted-foreground">({m.count})</span></span><span className="font-bold">{fmt(m.total)}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

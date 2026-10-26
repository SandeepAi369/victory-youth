import { ArrowUpRight } from "lucide-react";
import { getCategoryLedger, getExpenseLedger, getMemberLedger } from "@/lib/queries/ledger";
import { LedgerCard } from "@/components/admin/LedgerCard";

export const dynamic = "force-dynamic";

const fmt = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/** Per-category ledgers. Chanda and Donations are independent and never added together. */
export default async function SummaryPage() {
  const [chanda, donations, membersLedger, expenses] = await Promise.all([getCategoryLedger("CHANDA"), getCategoryLedger("DONATION"), getMemberLedger(), getExpenseLedger()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial Summary</h1>
        <p className="text-sm text-muted-foreground">Each category is a separate book — complete ledger (all years, published and unpublished).</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <LedgerCard title="Chanda" href="/admin/chanda" ledger={chanda} tone="amber" detailed />
        <LedgerCard title="Donations" href="/admin/donations" ledger={donations} tone="emerald" detailed />
        <LedgerCard title="Members" href="/admin/members" ledger={membersLedger} tone="emerald" detailed />
      </div>

      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="font-bold text-foreground mb-1 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-red-600" /> Expenses (Money Out)</h3>
        <p className="text-2xl font-black text-red-600 mb-3">{fmt(expenses.total)}</p>
        {expenses.byCategory.length === 0 ? <p className="text-sm text-muted-foreground">No expense entries yet</p> : (
          <div className="space-y-2">
            {expenses.byCategory.map((c) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span><span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">{c.category}</span><span className="text-xs text-muted-foreground ml-2">({c.count})</span></span>
                <span className="font-bold text-red-600">{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

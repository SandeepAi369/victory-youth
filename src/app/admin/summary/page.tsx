import { getDb, schema } from "@/db";
import { eq, count, sum } from "drizzle-orm";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

export const dynamic = "force-dynamic";

type CategoryTotal = { category: string; total: number; count: number };

export default async function SummaryPage() {
  let totalIn = 0, totalOut = 0, inByCategory: CategoryTotal[] = [], outByCategory: CategoryTotal[] = [];
    try {
      const db = getDb();
      const inResult = await db.select({ total: sum(schema.donations.amount) }).from(schema.donations);
      totalIn = Number(inResult[0]?.total || 0);
      
      const outResult = await db.select({ total: sum(schema.transactions.amount) }).from(schema.transactions).where(eq(schema.transactions.type, "EXPENSE"));
      totalOut = Number(outResult[0]?.total || 0);

      // Category breakdown - income
      const inCats = await db.select({ category: schema.donations.category, total: sum(schema.donations.amount), cnt: count() }).from(schema.donations).groupBy(schema.donations.category);
      inByCategory = inCats.map(c => ({ category: c.category || "GENERAL", total: Number(c.total || 0), count: c.cnt }));

      // Category breakdown - expenses
      const outCats = await db.select({ category: schema.transactions.category, total: sum(schema.transactions.amount), cnt: count() }).from(schema.transactions).where(eq(schema.transactions.type, "EXPENSE")).groupBy(schema.transactions.category);
      outByCategory = outCats.map(c => ({ category: c.category || "GENERAL", total: Number(c.total || 0), count: c.cnt }));
  } catch (e) { console.error("Summary error:", e); }

  const netBalance = totalIn - totalOut;
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Financial Summary</h1>
        <p className="text-sm text-muted-foreground">Auto-calculated from all Money In and Money Out entries</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2"><ArrowDownLeft className="w-5 h-5" /><span className="font-medium text-sm">Total Money In</span></div>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{fmt(totalIn)}</p>
        </div>
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2"><ArrowUpRight className="w-5 h-5" /><span className="font-medium text-sm">Total Money Out</span></div>
          <p className="text-3xl font-black text-red-700 dark:text-red-300">{fmt(totalOut)}</p>
        </div>
        <div className={`p-6 rounded-xl border ${netBalance >= 0 ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"}`}>
          <div className="flex items-center gap-2 mb-2"><Scale className="w-5 h-5" /><span className="font-medium text-sm">Net Balance</span></div>
          <p className={`text-3xl font-black ${netBalance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"}`}>{fmt(netBalance)}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="font-bold text-foreground mb-4">Income by Category</h3>
          {inByCategory.length === 0 ? <p className="text-sm text-muted-foreground">No income entries yet</p> : (
            <div className="space-y-3">
              {inByCategory.map(c => (
                <div key={c.category} className="flex items-center justify-between">
                  <div><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">{c.category}</span><span className="text-xs text-muted-foreground ml-2">({c.count} entries)</span></div>
                  <span className="font-bold text-emerald-600">{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="font-bold text-foreground mb-4">Expenses by Category</h3>
          {outByCategory.length === 0 ? <p className="text-sm text-muted-foreground">No expense entries yet</p> : (
            <div className="space-y-3">
              {outByCategory.map(c => (
                <div key={c.category} className="flex items-center justify-between">
                  <div><span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">{c.category}</span><span className="text-xs text-muted-foreground ml-2">({c.count} entries)</span></div>
                  <span className="font-bold text-red-600">{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

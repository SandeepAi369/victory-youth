import Link from "next/link";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import { getPublishedChanda, getContributionTotals, getPublicYears, type PublicYears } from "@/lib/queries/public";
import { ContributionTotals } from "@/components/public/ContributionTotals";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChandaPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let chandas: Awaited<ReturnType<typeof getPublishedChanda>> = [];
  let totals: Awaited<ReturnType<typeof getContributionTotals>> | null = null;
  let years: PublicYears = null;
  try {
    years = await getPublicYears();
    [chandas, totals] = await Promise.all([getPublishedChanda(100, q, years), getContributionTotals("CHANDA", years)]);
  } catch (e) {
    console.error("Chanda page error:", e);
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">🪙 Chanda Collection</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">

        <SearchBox basePath="/chanda" query={q} resultCount={chandas.length} placeholder="Search chanda by name or purpose…" />
        {totals && <ContributionTotals label="Chanda Collected" totals={totals} years={years} gradient="from-amber-500 to-orange-600" />}

        {chandas.length === 0 && (
          <div className="text-center py-20 text-stone-400">No chanda entries published yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chandas.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-800 border border-amber-100 dark:border-stone-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
                  {d.donorName?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{d.donorName}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{d.purpose || "Chanda"} · {d.date}</p>
                </div>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400">₹{Math.round(Number(d.amount) || 0).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

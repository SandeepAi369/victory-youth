import Link from "next/link";
import { PersonRow } from "@/components/public/PersonRow";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import { getPublishedContributors, getContributionTotals, getPublicYears, type PublicYears } from "@/lib/queries/public";
import { ContributionTotals } from "@/components/public/ContributionTotals";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChandaPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let chandas: Awaited<ReturnType<typeof getPublishedContributors>> = [];
  let totals: Awaited<ReturnType<typeof getContributionTotals>> | null = null;
  let years: PublicYears = null;
  try {
    years = await getPublicYears();
    [chandas, totals] = await Promise.all([getPublishedContributors("CHANDA", years, q), getContributionTotals("CHANDA", years)]);
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
          {/* One row per person; their itemized history is on their profile */}
          {chandas.map((p) => <PersonRow key={p.key} person={p} noun="chanda" tone="amber" />)}
        </div>
      </div>
    </main>
  );
}

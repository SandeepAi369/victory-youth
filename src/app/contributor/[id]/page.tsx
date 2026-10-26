import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicContributor } from "@/lib/queries/public";
import { ArrowLeft, Infinity as AllTime } from "lucide-react";

export const dynamic = "force-dynamic";

const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

/**
 * Public profile of one named contributor: their complete all-time history and
 * all-time total (unlike the global totals, which follow the admin's year selection).
 */
export default async function ContributorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPublicContributor(id);
  if (!person) notFound();
  // A profile belongs to ONE category: chanda profiles never show donations, and vice versa
  const book = person.kind === "CHANDA"
    ? { label: "Chanda", href: "/chanda", noun: "chanda" }
    : { label: "Donations", href: "/donations", noun: "donation" };

  const years = person.contributions.map((c) => c.date?.slice(0, 4)).filter(Boolean).sort();
  const firstYear = years[0];

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={book.href} className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {book.label}
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white truncate">🙏 {person.name}</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center font-black text-xl">{person.name[0]}</div>
              <div>
                <p className="text-xl font-black">{person.name}</p>
                <p className="text-sm text-white/80">
                  {book.label} · {person.contributions.length} {book.noun}{person.contributions.length === 1 ? "" : "s"}
                  {firstYear ? ` · since ${firstYear}` : ""}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 ring-1 ring-white/30 px-3 py-1 text-xs font-bold">
              <AllTime className="w-3.5 h-3.5" /> All-time
            </span>
          </div>
          <p className="text-sm text-white/80 mt-4">All-time {book.noun} total</p>
          <p className="text-3xl font-black">{inr(person.total)}</p>
          <p className="text-[11px] text-white/70 mt-1">Every year of {book.label} only — not only the year shown on the main pages.</p>
        </div>

        <h2 className="text-sm font-bold text-stone-500 dark:text-stone-400 mb-3">Complete {book.noun} history</h2>
        {/* Itemized: one row per entry exactly as recorded — never grouped or summed */}
        <ul className="space-y-2">
          {person.contributions.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 border border-amber-100 dark:border-stone-700 shadow-sm">
              <div className="min-w-0">
                <p className="font-bold text-stone-900 dark:text-white">{c.date || "—"}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{c.purpose}</p>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">{inr(c.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

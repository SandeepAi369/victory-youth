import Link from "next/link";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import { getPublicCommittee } from "@/lib/queries/public";
import { ArrowLeft, Users, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

/** Public Committee page: one row per member (name ›, role, payments, total); history on click. */
export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  const members = await getPublicCommittee(q);
  const total = members.reduce((s, m) => s + (Number(m.total) || 0), 0);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">👥 Committee Members</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <SearchBox basePath="/members" query={q} resultCount={members.length} placeholder="Search committee members by name or role…" />
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-white/80" />
            <p className="text-sm font-medium text-white/80">Victory Youth Committee</p>
          </div>
          <p className="text-3xl font-black">{inr(total)}</p>
          <p className="text-sm text-white/70 mt-1">Total contribution · {members.length} members</p>
        </div>

        {members.length === 0 && <div className="text-center py-20 text-stone-400">No committee members to display.</div>}

        {/* One row per member; their itemized payments are on their page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => {
            const count = Number(m.count);
            return (
              <Link key={m.id} href={`/members/${m.id}`} aria-label={`${m.name} — view contribution history`}
                className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 border border-indigo-100 dark:border-stone-700 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">{m.name?.[0] || "?"}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 dark:text-white flex items-center gap-0.5">
                      <span className="truncate">{m.name}</span>
                      <ChevronRight className="w-4 h-4 shrink-0 text-indigo-500 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{m.role} · {count} payment{count === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">{inr(m.total)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

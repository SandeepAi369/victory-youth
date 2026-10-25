import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { getPublicActiveMembers } from "@/lib/queries/public";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";

export const dynamic = "force-dynamic";

export default async function ActiveMembersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  const members = await getPublicActiveMembers(q);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">🙋 Active Members</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <SearchBox basePath="/active-members" query={q} resultCount={members.length} placeholder="Search active members by name…" />

        {members.length === 0 ? (
          <div className="text-center py-20 text-stone-400">{q ? "No matching members." : "No active members listed yet."}</div>
        ) : (
          <ol className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 shadow-sm">
            {members.map((m, i) => (
              <li key={m.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-8 text-right text-xs font-mono text-stone-400">{i + 1}.</span>
                <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden />
                <span className="font-semibold text-stone-900 dark:text-white">{m.name}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

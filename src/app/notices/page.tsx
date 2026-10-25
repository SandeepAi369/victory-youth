import { errorMessage } from "@/lib/utils";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import Link from "next/link";
import { getPublishedNotices, getPublishedNotes } from "@/lib/queries/public";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NoticesPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let notices: Awaited<ReturnType<typeof getPublishedNotices>> = [];
  let notes: Awaited<ReturnType<typeof getPublishedNotes>> = [];
  let error = "";
  try {
    [notices, notes] = await Promise.all([
      getPublishedNotices(50, q),
      getPublishedNotes(50, q),
    ]);
  } catch (e) {
    error = errorMessage(e) || "Failed to load notices.";
    console.error("Notices page error:", e);
  }

  // Merge and sort by date descending
  const allItems = [
    ...notices.map(n => ({ ...n, _type: "Notice" as const, _date: n.createdAt })),
    ...notes.map(n => ({ ...n, _type: "Note" as const, _date: n.createdAt })),
  ].sort((a, b) => {
    const da = a._date ? new Date(a._date).getTime() : 0;
    const db2 = b._date ? new Date(b._date).getTime() : 0;
    return db2 - da;
  });

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">📢 Notices & Updates</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">

        <SearchBox basePath="/notices" query={q} resultCount={allItems.length} placeholder="Search notices and updates…" />
        {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400">{error}</div>}

        {allItems.length === 0 && !error && (
          <div className="text-center py-20 text-stone-400">No notices or updates at this time.</div>
        )}

        <div className="space-y-4">
          {allItems.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item._type === "Notice" ? "bg-teal-100 dark:bg-teal-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                  <span className="text-lg">{item._type === "Notice" ? "📋" : "📝"}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-stone-900 dark:text-white">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item._type === "Notice" ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {item._type}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{item._type === "Notice" ? item.body : String(item.content ?? "")}</p>
                  {item._type === "Note" && item.category && <span className="text-xs text-stone-400 mt-2 block">Category: {item.category}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

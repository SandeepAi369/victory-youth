import Link from "next/link";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import { getPublishedNotes } from "@/lib/queries/public";
import { ArrowLeft, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let notes: Awaited<ReturnType<typeof getPublishedNotes>> = [];
  try {
    notes = await getPublishedNotes(50, q);
  } catch (e) {
    console.error("Notes page error:", e);
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">📝 Notes</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">

        <SearchBox basePath="/notes" query={q} resultCount={notes.length} placeholder="Search notes…" />
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-white/80" />
            <p className="text-sm font-medium text-white/80">Victory Youth Committee</p>
          </div>
          <p className="text-3xl font-black">{notes.length} Notes</p>
          <p className="text-sm text-white/70 mt-1">Important updates & committee notes</p>
        </div>

        {notes.length === 0 && (
          <div className="text-center py-20 text-stone-400">No published notes at this time.</div>
        )}

        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-stone-900 dark:text-white">{note.title}</h3>
                    {note.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {note.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                    {typeof note.content === "string" ? note.content : JSON.stringify(note.content)}
                  </p>
                  <p className="text-xs text-stone-400 mt-2">— {note.authorName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

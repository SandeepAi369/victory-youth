import { errorMessage } from "@/lib/utils";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import Link from "next/link";
import { getPublishedEvents, getPublicYears } from "@/lib/queries/public";
import { ArrowLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let events: Awaited<ReturnType<typeof getPublishedEvents>> = [];
  let error = "";
  try {
    events = await getPublishedEvents(q, await getPublicYears());
  } catch (e) {
    error = errorMessage(e) || "Failed to load events.";
    console.error("Events page error:", e);
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">📅 Festival Schedule</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-5xl px-4 py-8">

        <SearchBox basePath="/events" query={q} resultCount={events.length} placeholder="Search events by name, place or type…" />
        {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400">{error}</div>}

        {events.length === 0 && !error && (
          <div className="text-center py-20 text-stone-400">No published events at this time.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div key={evt.id} className="group bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-700 hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative aspect-video bg-stone-100 dark:bg-stone-700 overflow-hidden">
                {evt.imageUrl ? (
                  <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-stone-300 dark:text-stone-600" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">Day {evt.day}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2">{evt.title}</h3>
                {evt.titleTe && <p className="text-sm text-stone-500 dark:text-stone-400 mb-2" lang="te">{evt.titleTe}</p>}
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-3 flex-1">{evt.description}</p>
                <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                  {evt.timing && <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300"><span>🕒</span> <span className="font-medium">{evt.date} · {evt.timing}</span></div>}
                  {evt.location && <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300"><span>📍</span> <span>{evt.location}</span></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

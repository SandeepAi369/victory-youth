import { errorMessage } from "@/lib/utils";
import Link from "next/link";
import { getPublishedGallery } from "@/lib/queries/public";
import { ArrowLeft, CalendarDays, ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

// Dates are shown in Indian time regardless of where the Worker runs
const TIME_ZONE = "Asia/Kolkata";
const monthKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit" });
const monthLabel = new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, month: "long", year: "numeric" });
const dayLabel = new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric" });

type Photo = Awaited<ReturnType<typeof getPublishedGallery>>[number];

/** Groups photos (already newest-first) into months, newest month first. */
function groupByMonth(photos: Photo[]) {
  const groups: { key: string; label: string; photos: Photo[] }[] = [];
  for (const photo of photos) {
    const date = photo.uploadedAt ?? new Date(0);
    const key = monthKey.format(date);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, label: photo.uploadedAt ? monthLabel.format(date) : "Undated", photos: [] };
      groups.push(group);
    }
    group.photos.push(photo);
  }
  return groups;
}

export default async function GalleryPage() {
  let gallery: Photo[] = [];
  let error = "";
  try {
    gallery = await getPublishedGallery(500);
  } catch (e) {
    error = errorMessage(e) || "Failed to load gallery.";
    console.error("Gallery page error:", e);
  }
  const months = groupByMonth(gallery);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">🖼️ Photo Gallery</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400">{error}</div>}

        {gallery.length === 0 && !error && (
          <div className="text-center py-20 text-stone-400">No photos in the gallery yet.</div>
        )}

        {/* One section per month, newest first, with clear spacing between months */}
        <div className="space-y-14">
          {months.map((month) => (
            <section key={month.key} aria-labelledby={`month-${month.key}`}>
              <div className="sticky top-14 z-10 -mx-4 px-4 py-3 mb-4 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur flex items-center gap-3 border-b border-orange-200/60 dark:border-yellow-700/30">
                <CalendarDays className="w-5 h-5 text-orange-500" aria-hidden />
                <h2 id={`month-${month.key}`} className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                  {month.label}
                </h2>
                <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <ImageIcon className="w-3.5 h-3.5" aria-hidden />
                  {month.photos.length} photo{month.photos.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Row-by-row grid so photos read newest → oldest */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
                {month.photos.map((photo) => (
                  <figure key={photo.id} className="rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-sm hover:shadow-lg transition-shadow">
                    <img src={photo.url} alt={photo.title || "Gallery photo"} className="w-full h-auto block" loading="lazy" />
                    {photo.uploadedAt && (
                      <figcaption className="px-3 py-1.5 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-white/90 dark:bg-stone-900/90">
                        <time dateTime={photo.uploadedAt.toISOString()}>{dayLabel.format(photo.uploadedAt)}</time>
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

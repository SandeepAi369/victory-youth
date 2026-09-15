import Link from "next/link";
import { getPublishedGallery } from "@/lib/queries/public";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let gallery: any[] = [];
  let error = "";
  try {
    gallery = await getPublishedGallery(100);
  } catch (e: any) {
    error = e.message || "Failed to load gallery.";
    console.error("Gallery page error:", e);
  }

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

        {/* Clean masonry grid — original quality, no titles */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {gallery.map((photo: any) => (
            <div key={photo.id} className="break-inside-avoid rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-sm hover:shadow-lg transition-shadow">
              <img
                src={photo.url}
                alt="Gallery photo"
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

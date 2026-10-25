import { errorMessage } from "@/lib/utils";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import Link from "next/link";
import { getPublishedDonations } from "@/lib/queries/public";
import { ArrowLeft, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonationsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let donations: Awaited<ReturnType<typeof getPublishedDonations>> = [];
  let error = "";
  try {
    donations = await getPublishedDonations(100, q);
  } catch (e) {
    error = errorMessage(e) || "Failed to load donations.";
    console.error("Donations page error:", e);
  }

  const totalAmount = donations.reduce((sum: number, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">🙏 Our Generous Donors</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">

        <SearchBox basePath="/donations" query={q} resultCount={donations.length} placeholder="Search donations by donor, purpose or category…" />
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-white/80" />
            <p className="text-sm font-medium text-white/80">Total Donations Received</p>
          </div>
          <p className="text-3xl font-black mt-1">₹{Math.round(totalAmount).toLocaleString("en-IN")}</p>
          <p className="text-sm text-white/70 mt-1">{donations.length} generous donors</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400">{error}</div>}

        {donations.length === 0 && !error && (
          <div className="text-center py-20 text-stone-400">No published donations yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {donations.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-800 border border-orange-100 dark:border-stone-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  {d.donorName?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{d.donorName}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{d.category || "General"} · {d.date}</p>
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

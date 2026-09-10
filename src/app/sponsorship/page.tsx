import Link from "next/link";
import { getPublishedSponsors } from "@/lib/queries/public";
import { ArrowLeft, Award } from "lucide-react";

export const dynamic = "force-dynamic";

const TIER_COLORS: Record<string, string> = {
  "MAHA RAJA": "from-yellow-400 to-amber-500 border-yellow-300",
  "DIAMOND": "from-cyan-400 to-blue-500 border-cyan-300",
  "GOLD": "from-yellow-500 to-orange-500 border-yellow-400",
  "SILVER": "from-gray-300 to-gray-400 border-gray-300",
  "BRONZE": "from-orange-600 to-amber-700 border-orange-500",
};

export default async function SponsorshipPage() {
  let sponsors: any[] = [];
  try {
    sponsors = await getPublishedSponsors();
  } catch (e: any) {
    console.error("Sponsorship page error:", e);
  }

  const totalAmount = sponsors.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  // Group sponsors by tier
  const grouped: Record<string, any[]> = {};
  sponsors.forEach((s: any) => {
    const tier = s.tier || "OTHER";
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(s);
  });

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">🏆 Our Sponsors</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <p className="text-sm font-medium text-white/80">Total Sponsorship</p>
          <p className="text-3xl font-black mt-1">₹{totalAmount.toLocaleString("en-IN")}</p>
          <p className="text-sm text-white/70 mt-1">{sponsors.length} sponsors</p>
        </div>

        {sponsors.length === 0 && (
          <div className="text-center py-20 text-stone-400">No sponsors published yet.</div>
        )}

        {Object.entries(grouped).map(([tier, tierSponsors]) => (
          <div key={tier} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">{tier} Sponsors</h2>
              <span className="text-sm text-stone-500 dark:text-stone-400">({tierSponsors.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierSponsors.map((s: any) => (
                <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TIER_COLORS[tier] || "from-stone-400 to-stone-500 border-stone-300"} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {s.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{tier}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-700">
                    <span className="text-sm text-stone-500 dark:text-stone-400">{s.contactPerson || ""}</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">₹{s.amount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

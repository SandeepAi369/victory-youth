import Link from "next/link";
import { getPublishedChanda } from "@/lib/queries/public";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChandaPage() {
  let chandas: any[] = [];
  try {
    chandas = await getPublishedChanda(100);
  } catch (e: any) {
    console.error("Chanda page error:", e);
  }

  const totalAmount = chandas.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">🪙 Chanda Collection</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <p className="text-sm font-medium text-white/80">Total Chanda Collected</p>
          <p className="text-3xl font-black mt-1">₹{Math.round(totalAmount).toLocaleString("en-IN")}</p>
          <p className="text-sm text-white/70 mt-1">{chandas.length} contributions</p>
        </div>

        {chandas.length === 0 && (
          <div className="text-center py-20 text-stone-400">No chanda entries published yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chandas.map((d: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-800 border border-amber-100 dark:border-stone-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
                  {d.donorName?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{d.donorName}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{d.purpose || "Chanda"} · {d.date}</p>
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

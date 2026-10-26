import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicMember } from "@/lib/queries/public";
import { ArrowLeft, Infinity as AllTime } from "lucide-react";

export const dynamic = "force-dynamic";

const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

/** Public page of one committee member: all-time total and every payment, itemized. */
export default async function CommitteeMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getPublicMember(id);
  if (!member) notFound();
  const firstYear = member.payments.map((p) => p.date?.slice(0, 4)).filter(Boolean).sort()[0];

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/members" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Committee
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white truncate">👥 {member.name}</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center font-black text-xl">{member.name[0]}</div>
              <div>
                <p className="text-xl font-black">{member.name}</p>
                <p className="text-sm text-white/80">{member.role} · {member.payments.length} payment{member.payments.length === 1 ? "" : "s"}{firstYear ? ` · since ${firstYear}` : ""}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 ring-1 ring-white/30 px-3 py-1 text-xs font-bold">
              <AllTime className="w-3.5 h-3.5" /> All-time
            </span>
          </div>
          <p className="text-sm text-white/80 mt-4">All-time total contribution</p>
          <p className="text-3xl font-black">{inr(member.total)}</p>
        </div>

        <h2 className="text-sm font-bold text-stone-500 dark:text-stone-400 mb-3">Complete contribution history</h2>
        {/* Itemized: one row per payment exactly as recorded */}
        <ul className="space-y-2">
          {member.payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 border border-indigo-100 dark:border-stone-700 shadow-sm">
              <div className="min-w-0">
                <p className="font-bold text-stone-900 dark:text-white">{p.date}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{p.purpose}</p>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">{inr(p.amount)}</span>
            </li>
          ))}
          {member.payments.length === 0 && <li className="text-center py-10 text-stone-400">No payments recorded yet.</li>}
        </ul>
      </div>
    </main>
  );
}

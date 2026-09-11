import Link from "next/link";
import { getDb, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  let members: any[] = [];
  try {
    const db = getDb();
    members = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.isActive, true))
      .orderBy(desc(schema.members.createdAt));
  } catch (e: any) {
    console.error("Members page error:", e);
  }

  const totalContribution = members.reduce((sum: number, m: any) => sum + (m.membershipFee || 0), 0);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-lg font-bold text-stone-900 dark:text-white">👥 Committee Members</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-white/80" />
            <p className="text-sm font-medium text-white/80">Victory Youth Committee</p>
          </div>
          <p className="text-3xl font-black">{members.length} Members</p>
          <p className="text-sm text-white/70 mt-1">Total Contribution: ₹{totalContribution.toLocaleString("en-IN")}</p>
        </div>

        {members.length === 0 && (
          <div className="text-center py-20 text-stone-400">No committee members published yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-800 border border-indigo-100 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                  {(m.fullName || m.name)?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{m.fullName || m.name}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{m.role || m.committeeRole || "Member"}</p>
                </div>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{(m.membershipFee || 0).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

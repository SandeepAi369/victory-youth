import Link from "next/link";
import { SearchBox, searchQuery } from "@/components/public/SearchBox";
import { getDb, schema } from "@/db";
import { and, eq, like, or } from "drizzle-orm";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

function formatAmount(val: unknown): string {
  const num = parseInt(String(val || 0), 10);
  return num.toLocaleString("en-IN");
}

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = searchQuery(await searchParams);
  let members: { id: string; name: string; fullName: string | null; role: string | null; committeeRole: string | null; membershipFee: number | null }[] = [];
  try {
    const db = getDb();
    // Only what the public page shows — never phone numbers or addresses
    members = await db.select({
      id: schema.members.id,
      name: schema.members.name,
      fullName: schema.members.fullName,
      role: schema.members.role,
      committeeRole: schema.members.committeeRole,
      membershipFee: schema.members.membershipFee,
    }).from(schema.members)
      .where(and(
        eq(schema.members.isActive, true),
        q ? or(like(schema.members.name, `%${q}%`), like(schema.members.fullName, `%${q}%`), like(schema.members.committeeRole, `%${q}%`)) : undefined
      ))
      .orderBy(schema.members.name);
  } catch (e) {
    console.error("Members page error:", e);
  }

  const totalContribution = members.reduce(
    (sum: number, m) => sum + parseInt(String(m.membershipFee || 0), 10), 0
  );

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

        <SearchBox basePath="/members" query={q} resultCount={members.length} placeholder="Search committee members by name or role…" />
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-white/80" />
            <p className="text-sm font-medium text-white/80">Victory Youth Committee</p>
          </div>
          <p className="text-3xl font-black">{members.length} Members</p>
          <p className="text-sm text-white/70 mt-1">Total Contribution: ₹{formatAmount(totalContribution)}</p>
        </div>

        {members.length === 0 && (
          <div className="text-center py-20 text-stone-400">No committee members to display.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => (
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
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{formatAmount(m.membershipFee)}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

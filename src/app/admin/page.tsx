import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, IndianRupee, HandCoins, Scale, Users, Calendar, StickyNote } from "lucide-react";
import { getDb, schema } from "@/db";
import { count } from "drizzle-orm";
import Link from "next/link";
import { getCategoryLedger, getExpenseLedger, getMemberLedger } from "@/lib/queries/ledger";
import { LedgerCard } from "@/components/admin/LedgerCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let eventCount = 0, noteCount = 0, memberCount = 0;
  // Chanda and Donations are separate books — shown side by side, never summed
  const [chanda, donations, membersLedger, expenses] = await Promise.all([getCategoryLedger("CHANDA"), getCategoryLedger("DONATION"), getMemberLedger(), getExpenseLedger()]);
  try {
    const db = getDb();
    const [events, notes, members] = await Promise.all([
      db.select({ cnt: count() }).from(schema.events),
      db.select({ cnt: count() }).from(schema.importantNotes),
      db.select({ cnt: count() }).from(schema.members),
    ]);
    eventCount = events[0]?.cnt || 0;
    noteCount = notes[0]?.cnt || 0;
    memberCount = members[0]?.cnt || 0;
  } catch (e) { console.error("Dashboard query error:", e); }

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const quickLinks = [
    { href: "/admin/chanda", label: "Chanda", icon: IndianRupee, desc: `${chanda.count} entries · ${fmt(chanda.total)}`, color: "text-amber-600" },
    { href: "/admin/donations", label: "Donations", icon: HandCoins, desc: `${donations.count} entries · ${fmt(donations.total)}`, color: "text-emerald-600" },
    { href: "/admin/summary", label: "Summary", icon: Scale, desc: "Per-category ledgers", color: "text-blue-600" },
    { href: "/admin/members", label: "Members", icon: Users, desc: `${memberCount} members`, color: "text-purple-600" },
    { href: "/admin/events", label: "Events", icon: Calendar, desc: `${eventCount} events`, color: "text-indigo-600" },
    { href: "/admin/notes", label: "Notes", icon: StickyNote, desc: `${noteCount} notes`, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Victory Youth Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">50th Golden Jubilee Ganesh Utsav — Live Overview</p>
      </div>

      {/* Top Cards: each category on its own */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <LedgerCard title="Chanda" href="/admin/chanda" ledger={chanda} tone="amber" />
        <LedgerCard title="Donations" href="/admin/donations" ledger={donations} tone="emerald" />
        <LedgerCard title="Members" href="/admin/members" ledger={membersLedger} tone="emerald" />
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Expenses (Money Out)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black text-red-700 dark:text-red-300">{fmt(expenses.total)}</p></CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <Icon className={`w-6 h-6 ${link.color} mb-2`} />
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{link.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

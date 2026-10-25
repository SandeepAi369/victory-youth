import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, Scale, Users, Calendar, StickyNote } from "lucide-react";
import { getDb, schema } from "@/db";
import { count, sum, eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let totalIn = 0, totalOut = 0, donorCount = 0, eventCount = 0, noteCount = 0, memberCount = 0;

    try {
      const db = getDb();
      const [inRes, outRes, donors, events, notes, members] = await Promise.all([
        db.select({ total: sum(schema.donations.amount) }).from(schema.donations),
        db.select({ total: sum(schema.transactions.amount) }).from(schema.transactions).where(eq(schema.transactions.type, "EXPENSE")),
        db.select({ cnt: count() }).from(schema.donations),
        db.select({ cnt: count() }).from(schema.events),
        db.select({ cnt: count() }).from(schema.importantNotes),
        db.select({ cnt: count() }).from(schema.members),
      ]);
      totalIn = Number(inRes[0]?.total || 0);
      totalOut = Number(outRes[0]?.total || 0);
      donorCount = donors[0]?.cnt || 0;
      eventCount = events[0]?.cnt || 0;
      noteCount = notes[0]?.cnt || 0;
      memberCount = members[0]?.cnt || 0;
  } catch (e) { console.error("Dashboard query error:", e); }

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const netBalance = totalIn - totalOut;

  const quickLinks = [
    { href: "/admin/money-in", label: "Money In", icon: ArrowDownLeft, desc: `${donorCount} entries · ${fmt(totalIn)}`, color: "text-emerald-600" },
    { href: "/admin/money-out", label: "Money Out", icon: ArrowUpRight, desc: `${fmt(totalOut)} spent`, color: "text-red-600" },
    { href: "/admin/summary", label: "Summary", icon: Scale, desc: `Balance: ${fmt(netBalance)}`, color: netBalance >= 0 ? "text-blue-600" : "text-orange-600" },
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

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><ArrowDownLeft className="w-4 h-4" /> Total Money In</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{fmt(totalIn)}</p></CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Total Money Out</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black text-red-700 dark:text-red-300">{fmt(totalOut)}</p></CardContent>
        </Card>
        <Card className={`${netBalance >= 0 ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10" : "border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10"}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Scale className="w-4 h-4" /> Net Balance</CardTitle></CardHeader>
          <CardContent><p className={`text-3xl font-black ${netBalance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"}`}>{fmt(netBalance)}</p></CardContent>
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

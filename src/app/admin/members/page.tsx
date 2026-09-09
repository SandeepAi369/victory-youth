import { getDb, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  let members: any[] = [];
    try {
      const db = getDb();
      members = await db.select().from(schema.members).orderBy(desc(schema.members.createdAt));
  } catch (e) { console.error("Error fetching members:", e); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members Directory</h1>
        <p className="text-sm text-muted-foreground">{members.length} registered members</p>
      </div>

      {members.length === 0 ? (
        <div className="p-8 rounded-xl bg-muted/50 border border-border text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No members found. Members will appear here once added to the database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3">Name</th>
                <th className="p-3">Member ID</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Gotram</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{m.fullName || m.name}</td>
                  <td className="p-3 font-mono text-xs text-primary">{m.memberId}</td>
                  <td className="p-3">{m.role || "Member"}</td>
                  <td className="p-3 text-muted-foreground">{m.phone || m.mobile || "-"}</td>
                  <td className="p-3 text-muted-foreground">{m.gotram || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-stone-100 text-stone-500 dark:bg-stone-800"}`}>
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { UserCheck } from "lucide-react";
import { getActiveMemberNames } from "../members/actions";

// Admin data is per-request (session cookie) — never pre-render this page at build time
export const dynamic = "force-dynamic";

export default async function ActiveMembersPage() {
  const members = await getActiveMemberNames();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Active Members</h1>
          <p className="text-muted-foreground text-sm">
            {members.length} active member{members.length === 1 ? "" : "s"} — names only
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 bg-card border rounded-2xl">No active members yet.</p>
      ) : (
        <ol className="bg-card border rounded-2xl divide-y divide-border shadow-sm">
          {members.map((m, i) => (
            <li key={m.id} className="flex items-center gap-4 px-5 py-3">
              <span className="w-8 text-right text-xs font-mono text-muted-foreground">{i + 1}.</span>
              <span className="font-semibold text-foreground">{m.name}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

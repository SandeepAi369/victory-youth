"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, ChevronRight } from "lucide-react";
import { addMember, setAllMembersVisibility } from "./actions";
import { MemberForm, emptyMember, memberDate } from "./member-form";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";

type Member = {
  id: string;
  name: string;
  fullName: string | null;
  phone: string;
  membershipFee: number | null;
  role: string | null;
  committeeRole: string | null;
  isActive: boolean | null;
  memberId: string;
  joinDate?: string | null;
  createdAt?: Date | null;
};

/** Members list: one clean row per member; clicking opens the member's own page. */
export default function MembersClient({ initialData }: { initialData: Member[] }) {
  const { data, isPending, execute } = useAdminAction<Member>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (m) => [m.name, m.fullName, m.memberId, m.phone, m.role]);
  const [adding, setAdding] = useState(false);

  const published = data.length > 0 && data.some((m) => m.isActive === true);
  const totalFee = data.reduce((s, m) => s + (Number(m.membershipFee) || 0), 0);

  const handleGlobalToggle = () => {
    const newState = !published;
    execute({
      optimisticUpdate: (prev) => prev.map((m) => ({ ...m, isActive: newState })),
      serverAction: () => setAllMembersVisibility(newState),
      successMsg: newState ? "All members visible on frontend" : "All members hidden from frontend",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Committee Members</h1>
          <p className="text-muted-foreground text-sm">{data.length} members · ₹{totalFee.toLocaleString("en-IN")} in contributions</p>
        </div>
        <div className="flex items-center gap-3">
          {data.length > 0 && (
            <button onClick={handleGlobalToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all disabled:opacity-50 " +
                (published ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {published ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => setAdding(true)} disabled={isPending}
            className="px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {adding && (
        <MemberForm title="Add New Member" initial={emptyMember()} isPending={isPending}
          onCancel={() => setAdding(false)}
          onSubmit={(payload) => execute({ serverAction: () => addMember(payload), successMsg: "Added", onSuccess: () => setAdding(false) })} />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search members by name, member ID, phone or role…" shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl shadow-sm">
        <ul className="divide-y divide-border">
          {search && visible.length === 0 && data.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {data.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No members yet.</li>}
          {visible.map((m) => {
            const name = m.fullName || m.name;
            const role = m.role || m.committeeRole || "Member";
            return (
              <li key={m.id} data-person={name}>
                <Link href={`/admin/members/${m.id}`} aria-label={`Open ${name}'s page`}
                  className="group px-4 py-3 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold flex items-center gap-1">
                      <span className="truncate">{name}</span>
                      <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{role} · {m.phone} · {memberDate(m)}</p>
                  </div>
                  <span className="font-black text-emerald-600 shrink-0">₹{Math.round(Number(m.membershipFee) || 0).toLocaleString("en-IN")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

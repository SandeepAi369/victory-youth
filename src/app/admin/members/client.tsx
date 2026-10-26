"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, ChevronRight } from "lucide-react";
import { addMember, setAllMembersVisibility, setMemberAnonymous } from "./actions";
import type { getMembers } from "./actions";
import { MemberForm } from "./member-form";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";
import { AnonymousToggle } from "@/components/admin/ContributionControls";

type Member = Awaited<ReturnType<typeof getMembers>>[number];

const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

/**
 * Members (the public "Committee") — a money section like Chanda/Donations:
 * one clean row per member (name ›, role, payments, total), a separate
 * anonymous tick, and ONE Publish/Unpublish button at the top.
 */
export default function MembersClient({ initialData }: { initialData: Member[] }) {
  const { data, isPending, execute } = useAdminAction<Member>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (x) => [x.name, x.fullName, x.memberId, x.phone, x.role]);
  const [adding, setAdding] = useState(false);

  // The top button only ever touches NON-anonymous members
  const named = data.filter((x) => !x.isAnonymous);
  const allPublished = named.length > 0 && named.every((x) => x.isActive);
  const total = data.reduce((s, x) => s + (Number(x.total) || 0), 0);

  const handleGlobalToggle = () => {
    const next = !allPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((x) => x.isAnonymous ? x : { ...x, isActive: next }),
      serverAction: () => setAllMembersVisibility(next),
      successMsg: next ? "Members published (anonymous members untouched)" : "Members unpublished (anonymous members untouched)",
    });
  };

  const handleAnonymous = (x: Member) => {
    const next = !x.isAnonymous;
    const name = x.fullName || x.name;
    execute({
      optimisticUpdate: (prev) => prev.map((y) => y.id === x.id ? { ...y, isAnonymous: next, isActive: next ? false : y.isActive } : y),
      serverAction: () => setMemberAnonymous(x.id, next),
      successMsg: next ? `${name} is now anonymous — hidden from the public site` : `${name} is public again`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Committee Members</h1>
          <p className="text-muted-foreground text-sm">Total: {inr(total)} · {data.length} members</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {named.length > 0 && (
            <button onClick={handleGlobalToggle} disabled={isPending}
              title={`${allPublished ? "Unpublish" : "Publish"} every non-anonymous member. Anonymous members are never shown.`}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all disabled:opacity-50 " +
                (allPublished ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200")}>
              {allPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {allPublished ? "Unpublish" : "Publish"}
            </button>
          )}
          <button onClick={() => setAdding(true)} disabled={isPending}
            className="px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {adding && (
        <MemberForm title="Add New Member" editing={false} isPending={isPending}
          initial={{ fullName: "", phone: "", role: "Member", isAnonymous: false }}
          onCancel={() => setAdding(false)}
          onSubmit={(d) => execute({ serverAction: () => addMember(d), successMsg: "Member added", onSuccess: () => setAdding(false) })} />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search members by name, member ID, phone or role…" shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl shadow-sm">
        <ul className="divide-y divide-border">
          {search && visible.length === 0 && data.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {data.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No members yet.</li>}
          {visible.map((x) => {
            const name = (x.fullName || x.name).trim();
            const role = x.role || x.committeeRole || "Member";
            const count = Number(x.count);
            return (
              <li key={x.id} data-person={name} className="flex items-center gap-2 pr-3 hover:bg-muted/50 transition-colors">
                <Link href={`/admin/members/${x.id}`} aria-label={`Open ${name}'s page`}
                  className="group flex-1 min-w-0 pl-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold flex items-center gap-1">
                      <span className="truncate">{name}</span>
                      <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {role} · {count} payment{count === 1 ? "" : "s"}{x.lastDate ? ` · last ${x.lastDate}` : ""} · {x.phone}
                    </p>
                  </div>
                  <span className="font-black text-emerald-600 shrink-0">{inr(x.total)}</span>
                </Link>
                {/* The tick is its own control — it never opens the member's page */}
                <AnonymousToggle anonymous={!!x.isAnonymous} name={name} disabled={isPending} onToggle={() => handleAnonymous(x)} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

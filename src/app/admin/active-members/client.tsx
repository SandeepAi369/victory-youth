"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserCheck } from "lucide-react";
import { toggleMemberListing } from "../members/actions";
import type { getActiveMemberNames } from "../members/actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";

type Row = Awaited<ReturnType<typeof getActiveMemberNames>>[number];

export default function ActiveMembersClient({ initialData }: { initialData: Row[] }) {
  const { data, isPending, execute } = useAdminAction<Row>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (m) => [m.name]);
  const publishedCount = data.filter((m) => m.listedPublicly).length;

  const handleToggle = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((m) => (m.id === id ? { ...m, listedPublicly: !current } : m)),
      serverAction: () => toggleMemberListing(id, !current),
      successMsg: current ? "Hidden from the public list" : "Shown on the public list",
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Active Members</h1>
          <p className="text-muted-foreground text-sm">
            {data.length} active member{data.length === 1 ? "" : "s"} — {publishedCount} published on the public{" "}
            <Link href="/active-members" target="_blank" className="underline hover:text-foreground">Active Members</Link> page
          </p>
        </div>
      </div>

      <AdminSearch value={search} onChange={setSearch} placeholder="Search active members by name…" shown={visible.length} total={data.length} />

      {data.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 bg-card border rounded-2xl">No active members yet.</p>
      ) : (
        <ol className="bg-card border rounded-2xl divide-y divide-border shadow-sm">
          {search && visible.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No matches for &ldquo;{search}&rdquo;.</li>}
          {visible.map((m, i) => (
            <li key={m.id} className="flex items-center gap-4 px-5 py-3">
              <span className="w-8 text-right text-xs font-mono text-muted-foreground">{i + 1}.</span>
              <span className="flex-1 font-semibold text-foreground">{m.name}</span>
              <button
                onClick={() => handleToggle(m.id, !!m.listedPublicly)}
                disabled={isPending}
                title="Show or hide this name on the public Active Members page"
                className={
                  "px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 disabled:opacity-50 " +
                  (m.listedPublicly
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                    : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")
                }
              >
                {m.listedPublicly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {m.listedPublicly ? "PUBLISHED" : "DRAFT"}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

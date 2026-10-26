"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { MemberRow } from "@/db/schema";
import { updateMember, deleteMember } from "../actions";
import { MemberForm, memberDate } from "../member-form";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/** One member's own page: only their details, with Edit and Delete. */
export default function MemberPageClient({ member }: { member: MemberRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const name = member.fullName || member.name;
  const role = member.role || member.committeeRole || "Member";

  const run = (action: () => Promise<{ success: boolean; error?: string }>, ok: string, after: () => void) =>
    startTransition(async () => {
      const res = await action();
      if (!res.success) { toast.error(res.error || "Something went wrong"); return; }
      toast.success(ok);
      after();
    });

  const details: [string, string | null | undefined][] = [
    ["Member ID", member.memberId],
    ["Phone", member.phone],
    ["Mobile", member.mobile],
    ["Email", member.email],
    ["Father's name", member.fatherName],
    ["Gotram", member.gotram],
    ["Address", member.address],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/members" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Members
      </Link>

      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shrink-0">{name[0]}</div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{name}</h1>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditing(true)} disabled={isPending}
              className="px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-bold border bg-card hover:bg-muted disabled:opacity-50">
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => confirm(`Remove ${name}?`) && run(() => deleteMember(member.id), "Removed", () => router.push("/admin/members"))}
              disabled={isPending} className="px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-bold border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Contribution</p><p className="text-2xl font-black text-emerald-600">{inr(Number(member.membershipFee) || 0)}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Role</p><p className="text-lg font-bold">{role}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Joined</p><p className="text-lg font-bold">{memberDate(member)}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Status</p><p className="text-lg font-bold">{member.isActive ? "Active" : "Inactive"}</p></div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <h2 className="font-bold px-4 py-3 border-b">Details</h2>
        <dl className="divide-y divide-border">
          {details.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="px-4 py-3 grid grid-cols-[8rem_1fr] sm:grid-cols-[12rem_1fr] gap-4 text-sm">
              <dt className="text-muted-foreground">{k}</dt><dd className="font-medium break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {editing && (
        <MemberForm title={`Edit ${name}`} isPending={isPending}
          initial={{ fullName: name, phone: member.phone, membershipFee: String(member.membershipFee || 0), role, joinDate: member.joinDate || "" }}
          onCancel={() => setEditing(false)}
          onSubmit={(payload) => run(() => updateMember(member.id, payload), "Updated", () => { setEditing(false); router.refresh(); })} />
      )}
    </div>
  );
}

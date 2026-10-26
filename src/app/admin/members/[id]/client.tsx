"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Phone, Lock } from "lucide-react";
import type { MemberRow, MemberPaymentRow } from "@/db/schema";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AnonymousMark } from "@/components/admin/ContributionControls";
import { updateMember, deleteMember, addMemberPayment, updateMemberPayment, deleteMemberPayment } from "../actions";
import { MemberForm, PaymentForm, memberDate } from "../member-form";

const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

/** One member's own page: their details, total and every payment — nobody else's, no publish controls. */
export default function MemberPageClient({ member, initialPayments }: { member: MemberRow; initialPayments: MemberPaymentRow[] }) {
  const router = useRouter();
  const { data, isPending, execute } = useAdminAction<MemberPaymentRow>(initialPayments);
  const [editingMember, setEditingMember] = useState(false);
  const [payment, setPayment] = useState<{ editing: MemberPaymentRow | null } | null>(null);
  const name = (member.fullName || member.name).trim();
  const role = member.role || member.committeeRole || "Member";
  const total = data.reduce((s, x) => s + (x.amount || 0), 0);
  const lastDate = data.map((x) => x.date).sort().at(-1);

  const details: [string, string | null | undefined][] = [
    ["Member ID", member.memberId], ["Phone", member.phone], ["Mobile", member.mobile], ["Email", member.email],
    ["Father's name", member.fatherName], ["Gotram", member.gotram], ["Address", member.address], ["Joined", memberDate(member)],
  ];

  const handleDeletePayment = (x: MemberPaymentRow) => {
    if (!confirm(`Permanently delete this ${inr(x.amount)} payment?`)) return;
    execute({ optimisticUpdate: (prev) => prev.filter((y) => y.id !== x.id), serverAction: () => deleteMemberPayment(x.id), successMsg: "Deleted" });
  };
  const handleDeleteMember = () => {
    if (!confirm(`Remove ${name} and all of their payments?`)) return;
    execute({ serverAction: () => deleteMember(member.id), successMsg: "Member removed", onSuccess: () => router.push("/admin/members") });
  };

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
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {member.phone}</span>
                <span className="inline-flex items-center gap-1.5"><AnonymousMark anonymous={!!member.isAnonymous} /> {member.isAnonymous ? "Anonymous — admin only" : "Public name"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPayment({ editing: null })} disabled={isPending}
              className="px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Plus className="w-4 h-4" /> Add Payment
            </button>
            <button onClick={() => setEditingMember(true)} disabled={isPending}
              className="px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-bold border bg-card hover:bg-muted disabled:opacity-50">
              <Pencil className="w-4 h-4" /> Edit profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Total contribution</p><p className="text-2xl font-black text-emerald-600">{inr(total)}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Payments</p><p className="text-2xl font-black">{data.length}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Last payment</p><p className="text-lg font-bold">{lastDate || "—"}</p></div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b">
          <h2 className="font-bold">Payments</h2>
          {member.isAnonymous && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Anonymous — hidden from the public site</span>}
        </div>
        <ul className="divide-y divide-border" aria-label={`${name}'s payments`}>
          {data.length === 0 && <li className="px-4 py-10 text-center text-muted-foreground text-sm">No payments yet.</li>}
          {data.map((x) => (
            <li key={x.id} className="px-4 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_8rem_auto] items-center gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="font-bold">{x.date}</p>
                <p className="text-xs text-muted-foreground truncate">{(x.paymentMode || "").replace("_", " ")}{x.purpose ? ` · ${x.purpose}` : ""}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{x.receiptNo}</p>
              </div>
              <p className="font-black text-emerald-600 text-right">{inr(x.amount)}</p>
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                <button onClick={() => setPayment({ editing: x })} disabled={isPending} aria-label="Edit payment" title="Edit payment" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDeletePayment(x)} disabled={isPending} aria-label="Delete payment" title="Delete payment" className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <h2 className="font-bold px-4 py-3 border-b">Details</h2>
        <dl className="divide-y divide-border">
          {details.filter(([, v]) => v && v !== "—").map(([k, v]) => (
            <div key={k} className="px-4 py-3 grid grid-cols-[8rem_1fr] sm:grid-cols-[12rem_1fr] gap-4 text-sm">
              <dt className="text-muted-foreground">{k}</dt><dd className="font-medium break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="px-4 py-3 border-t">
          <button onClick={handleDeleteMember} disabled={isPending} className="text-sm font-bold text-red-600 hover:underline inline-flex items-center gap-1.5 disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Remove this member
          </button>
        </div>
      </div>

      {payment && (
        <PaymentForm
          title={payment.editing ? `Edit payment — ${name}` : `New payment — ${name}`}
          currentTotal={payment.editing ? total : undefined}
          initial={{ paymentMode: payment.editing?.paymentMode || "CASH", purpose: payment.editing?.purpose || "Membership" }}
          isPending={isPending}
          onCancel={() => setPayment(null)}
          onSubmit={async ({ amount, paymentMode, purpose }) => execute({
            serverAction: async () => {
              if (payment.editing) {
                const res = await updateMemberPayment(payment.editing.id, { paymentMode, purpose });
                if (!res.success || amount <= 0) return res;
              }
              return addMemberPayment(member.id, { amount, paymentMode, purpose });
            },
            successMsg: payment.editing ? (amount > 0 ? `₹${amount.toLocaleString("en-IN")} added as a new payment` : "Updated") : "Payment added",
            onSuccess: () => setPayment(null),
          })}
        />
      )}

      {editingMember && (
        <MemberForm title={`Edit ${name}`} editing isPending={isPending}
          initial={{ fullName: name, phone: member.phone, role, isAnonymous: !!member.isAnonymous }}
          onCancel={() => setEditingMember(false)}
          onSubmit={({ fullName, phone, role: r, isAnonymous }) => execute({
            serverAction: () => updateMember(member.id, { fullName, phone, role: r, isAnonymous }),
            successMsg: "Member updated",
            onSuccess: () => setEditingMember(false),
          })} />
      )}
    </div>
  );
}

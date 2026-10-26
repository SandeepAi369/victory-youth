"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { todayIST } from "@/lib/contributions";

const ROLES = ["Member", "Special Candidate"];

export type MemberDraft = { fullName: string; phone: string; membershipFee: string; role: string; joinDate: string };
/** A member's join date for display (falls back to when the record was created). */
export const memberDate = (m: { joinDate?: string | null; createdAt?: Date | null }) =>
  m.joinDate
    ? new Date(m.joinDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const emptyMember = (): MemberDraft => ({ fullName: "", phone: "", membershipFee: "", role: "Member", joinDate: todayIST() });

/** Add / edit one member (name, phone, contribution, role; the date is set automatically). */
export function MemberForm({ title, initial, isPending, onCancel, onSubmit }: {
  title: string;
  initial: MemberDraft;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (payload: { name: string; fullName: string; phone: string; membershipFee: number; role: string }) => void;
}) {
  const [form, setForm] = useState(initial);
  const input = "w-full bg-background border rounded-lg px-3 py-2";
  const label = "block text-xs font-bold text-muted-foreground mb-1";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name: form.fullName, fullName: form.fullName, phone: form.phone, membershipFee: parseInt(form.membershipFee) || 0, role: form.role });
        }}>
          <div>
            <label className={label} htmlFor="member-name">Full Name *</label>
            <input id="member-name" type="text" required autoFocus value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={input} placeholder="Enter full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="member-phone">Phone *</label>
              <input id="member-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} placeholder="9876543210" />
            </div>
            <div>
              <label className={label} htmlFor="member-fee">Contribution (₹) *</label>
              <input id="member-fee" type="number" required value={form.membershipFee} onChange={(e) => setForm({ ...form, membershipFee: e.target.value })} className={input} placeholder="5000" />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="member-role">Role</label>
            <select id="member-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={input}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Date (set automatically)</label>
            <input type="date" value={form.joinDate} readOnly className={input + " cursor-not-allowed opacity-70"} />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
            <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

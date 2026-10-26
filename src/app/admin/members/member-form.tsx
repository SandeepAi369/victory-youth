"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { PAYMENT_MODES, todayIST } from "@/lib/contributions";

const ROLES = ["Member", "Special Candidate"];

const input = "w-full bg-background border rounded-lg px-3 py-2";
const label = "block text-xs font-bold text-muted-foreground mb-1";

/** A member's join date for display (falls back to when the record was created). */
export const memberDate = (m: { joinDate?: string | null; createdAt?: Date | null }) =>
  m.joinDate
    ? new Date(m.joinDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Modal({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Actions({ isPending, onCancel }: { isPending: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-2 justify-end pt-4 border-t">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
      <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5">
        <Check className="w-4 h-4" /> {isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export type MemberDetails = { fullName: string; phone: string; role: string; isAnonymous: boolean };

/**
 * Add a member (with their first amount) or edit their details. Editing never
 * changes an amount — new money is added as a separate payment.
 */
export function MemberForm({ title, initial, editing, isPending, onCancel, onSubmit }: {
  title: string;
  initial: MemberDetails;
  editing: boolean;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (data: MemberDetails & { amount: number; paymentMode: string }) => void;
}) {
  const [form, setForm] = useState({ ...initial, amount: "", paymentMode: "CASH" });
  return (
    <Modal title={title} onCancel={onCancel}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: parseInt(form.amount) || 0 }); }}>
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
            <label className={label} htmlFor="member-role">Role</label>
            <select id="member-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={input}>
              {[...new Set([...ROLES, form.role])].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        {!editing && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="member-fee">Contribution (₹) *</label>
              <input id="member-fee" type="number" required min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} placeholder="5000" />
            </div>
            <div>
              <label className={label}>Payment Mode</label>
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={input}>
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
        )}
        {!editing && (
          <div>
            <label className={label}>Date (set automatically)</label>
            <input type="date" value={todayIST()} readOnly className={input + " cursor-not-allowed opacity-70"} />
          </div>
        )}
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} className="mt-0.5" />
          <span>
            <span className="font-bold">Anonymous member</span>
            <span className="block text-xs text-muted-foreground">Stays in the admin panel only — never shown on the public site.</span>
          </span>
        </label>
        <Actions isPending={isPending} onCancel={onCancel} />
      </form>
    </Modal>
  );
}

/**
 * Add a payment, or edit one: editing shows the member's current total and an
 * "Add amount" box — the added amount is saved as a NEW separate payment.
 */
export function PaymentForm({ title, currentTotal, initial, isPending, onCancel, onSubmit }: {
  title: string;
  /** Edit mode when set */
  currentTotal?: number;
  initial: { paymentMode: string; purpose: string };
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (data: { amount: number; paymentMode: string; purpose: string }) => void;
}) {
  const editing = currentTotal !== undefined;
  const [form, setForm] = useState({ ...initial, amount: "" });
  const added = parseInt(form.amount) || 0;
  return (
    <Modal title={title} onCancel={onCancel}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: added }); }}>
        {editing ? (
          <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-muted-foreground">Current total</span>
              <span className="text-xl font-black text-emerald-600">₹{currentTotal.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <label className={label} htmlFor="add-amount">Add amount (₹)</label>
              <input id="add-amount" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} placeholder="0" />
              <p className="mt-1 text-[11px] text-muted-foreground">Saved as a separate payment dated today, with its own receipt.</p>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">New total</span>
              <span className="font-black">₹{(currentTotal + Math.max(added, 0)).toLocaleString("en-IN")}</span>
            </div>
          </div>
        ) : (
          <div>
            <label className={label} htmlFor="payment-amount">Amount (₹) *</label>
            <input id="payment-amount" type="number" required min={1} autoFocus value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} placeholder="500" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Payment Mode</label>
            <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={input}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Date (set automatically)</label>
            <input type="date" value={todayIST()} readOnly className={input + " cursor-not-allowed opacity-70"} />
          </div>
        </div>
        <div>
          <label className={label}>Purpose</label>
          <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={input} placeholder="Membership" />
        </div>
        <Actions isPending={isPending} onCancel={onCancel} />
      </form>
    </Modal>
  );
}

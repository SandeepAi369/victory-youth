"use client";

import { useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { PAYMENT_MODES, todayIST, type ContributionCategory } from "@/lib/contributions";
import type { ContributionInput } from "@/lib/actions/contributors";

export type ContributorOption = {
  id: string; name: string; phone: string | null; isAnonymous: boolean; count: number; notes?: string | null;
};

export type ContributionDraft = {
  contributorId: string | null; amount: string;
  paymentMode: string; date: string; purpose: string;
};

export const today = todayIST;

export function emptyDraft(contributorId: string | null = null): ContributionDraft {
  return { contributorId, amount: "", paymentMode: "CASH", date: today(), purpose: "" };
}

/**
 * Add / edit one contribution of a FIXED category (no category choice: the
 * Chanda form only adds chanda, the Donations form only donations). The
 * contributor is picked from that category's profiles (search by name or
 * phone) or created on the spot; the anonymous switch belongs to the profile.
 */
export function ContributionForm({
  title, contributors, category, initial, currentAmount, isPending, onCancel, onSubmit,
}: {
  title: string;
  /** Profiles of this category only */
  contributors: ContributorOption[];
  category: ContributionCategory;
  initial: ContributionDraft;
  /**
   * Edit mode: the contributor's current total in this category. The form then
   * asks for an amount to ADD — recorded as a new, separate entry dated today
   * (never overwrites or merges) — and `amount` in onSubmit is that amount.
   */
  currentAmount?: number;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (input: ContributionInput) => void;
}) {
  const [form, setForm] = useState(initial);
  const noun = category === "CHANDA" ? "chanda" : "donation";
  const editing = currentAmount !== undefined;
  const added = parseInt(form.amount) || 0;
  // A plain Name + Phone form. Existing profiles of this category are only
  // SUGGESTED while typing a matching name; ignoring them creates a new person.
  const [person, setPerson] = useState({ name: "", phone: "" });
  const selected = contributors.find((c) => c.id === form.contributorId) ?? null;
  const [anonymous, setAnonymous] = useState(selected?.isAnonymous ?? false);

  const typed = person.name.trim().toLowerCase();
  const suggestions = useMemo(
    () => (typed.length < 2 ? [] : contributors.filter((c) => c.name.toLowerCase().includes(typed)).slice(0, 4)),
    [contributors, typed],
  );
  const sameName = suggestions.find((c) => c.name.toLowerCase() === typed);

  const pick = (c: ContributorOption) => { setForm({ ...form, contributorId: c.id }); setAnonymous(c.isAnonymous); setPerson({ name: "", phone: "" }); };
  const clearPerson = () => { setForm({ ...form, contributorId: null }); setAnonymous(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected && !person.name.trim()) return;
    onSubmit({
      contributorId: selected?.id,
      newContributor: selected ? undefined : { name: person.name, phone: person.phone },
      isAnonymous: anonymous,
      category, amount: added,
      paymentMode: form.paymentMode, purpose: form.purpose,
    });
  };

  const input = "w-full bg-background border rounded-lg px-3 py-2";
  const label = "block text-xs font-bold text-muted-foreground mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contributor: a chosen profile, or plain Name + Phone for a new person */}
          {selected ? (
            <div>
              <label className={label}>Name</label>
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <div className="min-w-0">
                  <p className="font-bold truncate">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.phone || "No phone"} · {selected.count} {noun}{selected.count === 1 ? "" : "s"} so far</p>
                </div>
                <button type="button" onClick={clearPerson} className="text-xs font-bold text-primary hover:underline shrink-0">Change</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="person-name">Name *</label>
                <input id="person-name" type="text" required autoFocus autoComplete="off" value={person.name}
                  onChange={(e) => setPerson({ ...person, name: e.target.value })} className={input} placeholder="Full name" />
                {suggestions.length > 0 && (
                  <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2 space-y-1">
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      {sameName ? `"${sameName.name}" already has a ${noun} profile — add to it?` : "Already in the list — add to an existing person?"}
                    </p>
                    {suggestions.map((c) => (
                      <button key={c.id} type="button" onClick={() => pick(c)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate"><b>{c.name}</b> <span className="text-xs text-muted-foreground">{c.phone || "No phone"} · {c.count} {noun}{c.count === 1 ? "" : "s"}</span></span>
                        <span className="text-xs font-bold text-primary shrink-0">Use</span>
                      </button>
                    ))}
                    <p className="text-[11px] text-muted-foreground">Or just continue — a new person will be added.</p>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="person-phone">Phone</label>
                <input id="person-phone" type="tel" value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} className={input} placeholder="9876543210 (optional)" />
              </div>
            </div>
          )}

          {editing && (
            <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-muted-foreground">Current total</span>
                <span className="text-xl font-black text-emerald-600">₹{currentAmount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <label className={label} htmlFor="add-amount">Add amount (₹)</label>
                <input id="add-amount" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} placeholder="0" />
                <p className="mt-1 text-[11px] text-muted-foreground">Saved as a separate entry dated today, with its own receipt.</p>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">New total</span>
                <span className="font-black">₹{(currentAmount + Math.max(added, 0)).toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!editing && (
              <div>
                <label className={label}>Amount (₹) *</label>
                <input type="number" required min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} placeholder="500" />
              </div>
            )}
            <div>
              <label className={label}>Payment Mode</label>
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={input}>
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Date (set automatically)</label>
              <input type="date" required value={form.date} readOnly className={input + " cursor-not-allowed opacity-70"} />
            </div>
          </div>
          <div>
            <label className={label}>Purpose</label>
            <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={input} placeholder={category === "CHANDA" ? "Monthly Chanda" : "General Donation"} />
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="font-bold">Anonymous contributor</span>
              <span className="block text-xs text-muted-foreground">
                Applies to <b>all</b> of this profile&apos;s {noun} entries, past and future. Anonymous entries stay in the admin panel only — they are never shown on the public site.
              </span>
            </span>
          </label>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
            <button type="submit" disabled={isPending || (!selected && !person.name.trim())} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

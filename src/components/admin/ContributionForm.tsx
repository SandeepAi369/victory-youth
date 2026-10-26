"use client";

import { useMemo, useState } from "react";
import { X, UserPlus, UserX, Search, Check } from "lucide-react";
import { PAYMENT_MODES, type ContributionCategory } from "@/lib/contributions";
import type { ContributionInput } from "@/lib/actions/contributors";

export type ContributorOption = {
  id: string; name: string; phone: string | null; isAnonymous: boolean; count: number;
};

export type ContributionDraft = {
  contributorId: string | null; category: string; amount: string;
  paymentMode: string; date: string; purpose: string;
};

export const today = () => new Date().toISOString().split("T")[0];

export function emptyDraft(category: string, contributorId: string | null = null): ContributionDraft {
  return { contributorId, category, amount: "", paymentMode: "CASH", date: today(), purpose: "" };
}

const CATEGORY_LABEL: Record<string, string> = { CHANDA: "Chanda", DONATION: "Donation", SPONSORSHIP: "Sponsorship", OTHER: "Other" };

/**
 * Add / edit one contribution. The contributor is picked from existing
 * profiles (search by name or phone) or created on the spot; the anonymous
 * switch belongs to the contributor, so it applies to all their contributions.
 */
export function ContributionForm({
  title, contributors, categories, initial, isPending, onCancel, onSubmit,
}: {
  title: string;
  contributors: ContributorOption[];
  categories: readonly ContributionCategory[];
  initial: ContributionDraft;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (input: ContributionInput) => void;
}) {
  const [form, setForm] = useState(initial);
  const [query, setQuery] = useState("");
  const [newPerson, setNewPerson] = useState<{ name: string; phone: string } | null>(null);
  const selected = contributors.find((c) => c.id === form.contributorId) ?? null;
  const [anonymous, setAnonymous] = useState(selected?.isAnonymous ?? false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contributors.slice(0, 8);
    return contributors.filter((c) => c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q)).slice(0, 8);
  }, [contributors, query]);
  const exactMatch = contributors.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());

  const pick = (c: ContributorOption) => {
    setForm({ ...form, contributorId: c.id }); setAnonymous(c.isAnonymous); setNewPerson(null); setQuery("");
  };
  const startNew = () => {
    setForm({ ...form, contributorId: null }); setAnonymous(false); setNewPerson({ name: query.trim(), phone: "" }); setQuery("");
  };
  const clearPerson = () => { setForm({ ...form, contributorId: null }); setNewPerson(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected && !newPerson?.name.trim()) return;
    onSubmit({
      contributorId: selected?.id,
      newContributor: selected ? undefined : { name: newPerson!.name, phone: newPerson!.phone },
      isAnonymous: anonymous,
      category: form.category, amount: parseInt(form.amount) || 0,
      paymentMode: form.paymentMode, date: form.date, purpose: form.purpose,
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
          {/* Contributor */}
          <div>
            <label className={label}>Contributor *</label>
            {selected ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <div className="min-w-0">
                  <p className="font-bold truncate">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.phone || "No phone"} · {selected.count} contribution{selected.count === 1 ? "" : "s"}</p>
                </div>
                <button type="button" onClick={clearPerson} className="text-xs font-bold text-primary hover:underline shrink-0">Change</button>
              </div>
            ) : newPerson ? (
              <div className="space-y-2 rounded-lg border border-dashed p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> New contributor</span>
                  <button type="button" onClick={clearPerson} className="text-xs font-bold text-muted-foreground hover:underline">Pick existing instead</button>
                </div>
                <input type="text" required autoFocus value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} className={input} placeholder="Full name" />
                <input type="tel" value={newPerson.phone} onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })} className={input} placeholder="Phone (optional)" />
              </div>
            ) : (
              <div className="rounded-lg border">
                <div className="flex items-center gap-2 px-3 border-b">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input type="text" autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent py-2 outline-none" placeholder="Search name or phone…" aria-label="Search contributors" />
                </div>
                <ul className="max-h-48 overflow-y-auto divide-y" role="listbox">
                  {matches.map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => pick(c)} className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between gap-2">
                        <span className="min-w-0">
                          <span className="font-medium block truncate">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.phone || "No phone"} · {c.count} contribution{c.count === 1 ? "" : "s"}</span>
                        </span>
                        {c.isAnonymous && <UserX className="w-4 h-4 text-violet-600 shrink-0" aria-label="Anonymous" />}
                      </button>
                    </li>
                  ))}
                  {matches.length === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">No contributor matches &ldquo;{query}&rdquo;.</li>}
                </ul>
                {!exactMatch && (
                  <button type="button" onClick={startNew} className="w-full px-3 py-2 border-t text-sm font-bold text-primary hover:bg-muted flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> {query.trim() ? <>Add new contributor &ldquo;{query.trim()}&rdquo;</> : "Add new contributor"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.length > 1 && (
              <div>
                <label className={label}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                  {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={label}>Amount (₹) *</label>
              <input type="number" required min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} placeholder="500" />
            </div>
            <div>
              <label className={label}>Payment Mode</label>
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={input}>
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Date *</label>
              <input type="date" required value={form.date} readOnly className={input + " cursor-not-allowed opacity-70"} />
            </div>
          </div>
          <div>
            <label className={label}>Purpose</label>
            <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={input} placeholder={form.category === "CHANDA" ? "Monthly Chanda" : form.category === "SPONSORSHIP" ? "Sponsorship" : "General Donation"} />
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="font-bold">Anonymous contributor</span>
              <span className="block text-xs text-muted-foreground">
                Applies to this person&apos;s <b>all</b> contributions, past and future — shown as &quot;Anonymous Devotee&quot; on the public site.
              </span>
            </span>
          </label>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
            <button type="submit" disabled={isPending || (!selected && !newPerson?.name.trim())} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

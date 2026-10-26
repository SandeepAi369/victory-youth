"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { UserPlus, Pencil, Trash2, CirclePlus, ChevronDown, ChevronRight, X } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";
import { ContributionForm, emptyDraft } from "@/components/admin/ContributionForm";
import { PublishSwitch, AnonymousMark } from "@/components/admin/ContributionControls";
import {
  addContribution, createContributor, updateContributor, deleteContributor,
  getContributorHistory, setContributionPublished,
} from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

type Contributor = {
  id: string; name: string; phone: string | null; isAnonymous: boolean; notes: string | null;
  count: number; total: number; lastDate: string | null;
};
type HistoryRow = Awaited<ReturnType<typeof getContributorHistory>>["rows"][number];
type Profile = { id: string | null; name: string; phone: string; notes: string; isAnonymous: boolean };

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

const TABS: { category: ContributionCategory; label: string; href: string }[] = [
  { category: "CHANDA", label: "Chanda", href: "/admin/contributors" },
  { category: "DONATION", label: "Donations", href: "/admin/contributors?tab=donations" },
];

/** Contributor profiles of ONE category (Chanda and Donations are separate tabs / books). */
export default function ContributorsClient({ category, initialData }: { category: ContributionCategory; initialData: Contributor[] }) {
  const book = category === "CHANDA" ? "Chanda" : "Donations";
  const noun = category === "CHANDA" ? "Chanda" : "Donation";
  const { data, isPending, execute } = useAdminAction<Contributor>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (c) => [c.name, c.phone, c.notes]);
  const [contributionFor, setContributionFor] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryRow[] | "loading" | "error">>({});

  const loadHistory = async (id: string) => {
    setHistory((h) => ({ ...h, [id]: "loading" }));
    const res = await getContributorHistory(id);
    setHistory((h) => ({ ...h, [id]: res.success ? res.rows : "error" }));
  };
  const toggleHistory = (id: string) => {
    if (expanded === id) return setExpanded(null);
    setExpanded(id);
    void loadHistory(id);
  };

  const handleTogglePublish = (contributorId: string, row: HistoryRow) => {
    const next = !row.isPublished;
    setHistory((h) => {
      const rows = h[contributorId];
      return Array.isArray(rows) ? { ...h, [contributorId]: rows.map((r) => r.id === row.id ? { ...r, isPublished: next } : r) } : h;
    });
    execute({
      serverAction: () => setContributionPublished(row.id, category, next),
      successMsg: next ? "Published" : "Unpublished",
      onSuccess: () => void loadHistory(contributorId),
    });
  };

  const handleDelete = (c: Contributor) => {
    if (!confirm(`Delete the profile of ${c.name}?`)) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((p) => p.id !== c.id),
      serverAction: () => deleteContributor(c.id),
      successMsg: "Contributor deleted",
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const { id, ...fields } = profile;
    execute({
      optimisticUpdate: id ? (prev) => prev.map((p) => p.id === id ? { ...p, ...fields } : p) : undefined,
      serverAction: () => id ? updateContributor(id, fields) : createContributor({ ...fields, category }),
      successMsg: id ? "Contributor updated" : "Contributor added",
      onSuccess: () => setProfile(null),
    });
  };

  const totalAmount = data.reduce((s, c) => s + Number(c.total || 0), 0);
  const anonymousCount = data.filter((c) => c.isAnonymous).length;
  const input = "w-full bg-background border rounded-lg px-3 py-2";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contributors</h1>
          <p className="text-muted-foreground text-sm">
            {book}: {data.length} profiles · {anonymousCount} anonymous · {inr(totalAmount)} in total
          </p>
        </div>
        <button onClick={() => setProfile({ id: null, name: "", phone: "", notes: "", isAnonymous: false })} disabled={isPending}
          className="px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          <UserPlus className="w-4 h-4" /> New {book} Contributor
        </button>
      </div>

      {/* Separate books: a person who gives to both has one profile on each tab */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit" role="tablist" aria-label="Category">
        {TABS.map((t) => (
          <Link key={t.category} href={t.href} role="tab" aria-selected={t.category === category}
            className={"px-4 py-1.5 rounded-lg text-sm font-bold transition-colors " + (t.category === category ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </Link>
        ))}
      </div>

      {contributionFor && (
        <ContributionForm
          title={`Add ${noun}`}
          contributors={data} category={category}
          initial={emptyDraft(contributionFor)} isPending={isPending}
          onCancel={() => setContributionFor(null)}
          onSubmit={(input) => execute({
            serverAction: () => addContribution(input),
            successMsg: `${noun} added`,
            // History is re-fetched whenever a row is expanded again
            onSuccess: () => { setExpanded(null); setContributionFor(null); },
          })}
        />
      )}

      {profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setProfile(null)}>
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{profile.id ? `Edit ${book} Contributor` : `New ${book} Contributor`}</h2>
              <button type="button" onClick={() => setProfile(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Name *</label>
                <input type="text" required autoFocus value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={input} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={input} placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Notes (admin only)</label>
                <input type="text" value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} className={input} placeholder="e.g. Pays chanda monthly" />
              </div>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={profile.isAnonymous} onChange={(e) => setProfile({ ...profile, isAnonymous: e.target.checked })} className="mt-0.5" />
                <span>
                  <span className="font-bold">Anonymous contributor</span>
                  <span className="block text-xs text-muted-foreground">Shown as &quot;Anonymous Devotee&quot; on all of this profile&apos;s {book.toLowerCase()} entries.</span>
                </span>
              </label>
              {profile.id && <p className="text-xs text-muted-foreground">Changes apply to all of this profile&apos;s {book.toLowerCase()} entries and receipts.</p>}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={() => setProfile(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder={`Search ${book.toLowerCase()} contributors by name, phone or notes…`} shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl shadow-sm">
        <ul className="divide-y divide-border">
          {search && visible.length === 0 && data.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {data.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No {book.toLowerCase()} contributors yet. They are created when you add a {noun.toLowerCase()}.</li>}
          {visible.map((c) => {
            const rows = history[c.id];
            return (
              <Fragment key={c.id}>
                <li className="px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 hover:bg-muted/40 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleHistory(c.id)} aria-label="Show contributions" aria-expanded={expanded === c.id} className="p-0.5 rounded hover:bg-muted text-muted-foreground shrink-0">
                        {expanded === c.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="font-bold truncate">{c.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6 truncate">
                      {c.phone || "No phone"} · {c.count} {noun.toLowerCase()}{c.count === 1 ? "" : "s"}{c.lastDate ? ` · last ${c.lastDate}` : ""}{c.notes ? ` · ${c.notes}` : ""}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600 text-right">{inr(c.total)}</p>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => setContributionFor(c.id)} disabled={isPending} title={`Add ${noun} for ${c.name}`}
                      className="mr-auto px-2.5 py-1 rounded-lg text-[11px] font-bold text-primary border border-primary/30 hover:bg-primary/10 inline-flex items-center gap-1 disabled:opacity-50">
                      <CirclePlus className="w-3.5 h-3.5" /> Add {noun}
                    </button>
                    <AnonymousMark anonymous={c.isAnonymous} />
                    <button onClick={() => setProfile({ id: c.id, name: c.name, phone: c.phone ?? "", notes: c.notes ?? "", isAnonymous: c.isAnonymous })} disabled={isPending} aria-label="Edit" title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c)} disabled={isPending || c.count > 0} aria-label="Delete" title={c.count > 0 ? "Has entries — cannot delete" : "Delete"} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
                {expanded === c.id && (
                  <li className="bg-muted/30 px-4 py-3">
                    {rows === "loading" && <p className="text-xs text-muted-foreground">Loading…</p>}
                    {rows === "error" && <p className="text-xs text-red-600">Could not load entries.</p>}
                    {Array.isArray(rows) && rows.length === 0 && <p className="text-xs text-muted-foreground">No entries yet.</p>}
                    {Array.isArray(rows) && rows.length > 0 && (
                      <ul className="divide-y divide-border text-xs" aria-label={`${c.name}'s ${book.toLowerCase()} entries`}>
                        {rows.map((r) => (
                          <li key={r.id} className="py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-mono text-muted-foreground">{r.date || "-"}</span>
                            <span className="font-bold text-emerald-600">{inr(r.amount)}</span>
                            <span className="text-muted-foreground truncate">{r.purpose}</span>
                            <span className="ml-auto"><PublishSwitch published={!!r.isPublished} disabled={isPending} onToggle={() => handleTogglePublish(c.id, r)} /></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
              </Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

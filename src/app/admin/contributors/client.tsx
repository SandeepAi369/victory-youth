"use client";

import { Fragment, useState } from "react";
import { UserPlus, Pencil, Trash2, User, UserX, CirclePlus, ChevronDown, ChevronRight, X } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";
import { ContributionForm, emptyDraft } from "@/components/admin/ContributionForm";
import {
  addContribution, createContributor, updateContributor, deleteContributor,
  setContributorAnonymous, getContributorHistory,
} from "@/lib/actions/contributors";
import { CONTRIBUTION_CATEGORIES } from "@/lib/contributions";

type Contributor = {
  id: string; name: string; phone: string | null; isAnonymous: boolean; notes: string | null;
  count: number; total: number; lastDate: string | null;
};
type HistoryRow = Awaited<ReturnType<typeof getContributorHistory>>["rows"][number];

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

export default function ContributorsClient({ initialData }: { initialData: Contributor[] }) {
  const { data, isPending, execute } = useAdminAction<Contributor>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (c) => [c.name, c.phone, c.notes]);
  const [contributionFor, setContributionFor] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ id: string | null; name: string; phone: string; notes: string; isAnonymous: boolean } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryRow[] | "loading" | "error">>({});

  const toggleHistory = async (id: string) => {
    if (expanded === id) return setExpanded(null);
    setExpanded(id);
    setHistory((h) => ({ ...h, [id]: "loading" }));
    const res = await getContributorHistory(id);
    setHistory((h) => ({ ...h, [id]: res.success ? res.rows : "error" }));
  };

  const handleAnonymous = (c: Contributor) => {
    const next = !c.isAnonymous;
    execute({
      optimisticUpdate: (prev) => prev.map((p) => p.id === c.id ? { ...p, isAnonymous: next } : p),
      serverAction: () => setContributorAnonymous(c.id, next),
      successMsg: next ? `${c.name} is now anonymous on all ${c.count} contribution(s)` : `${c.name}'s name is now shown on all contributions`,
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
      serverAction: () => id ? updateContributor(id, fields) : createContributor(fields),
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
            {data.length} profiles · {anonymousCount} anonymous · {inr(totalAmount)} in total
          </p>
        </div>
        <button onClick={() => setProfile({ id: null, name: "", phone: "", notes: "", isAnonymous: false })} disabled={isPending}
          className="px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          <UserPlus className="w-4 h-4" /> New Contributor
        </button>
      </div>

      {contributionFor && (
        <ContributionForm
          title="Add Contribution"
          contributors={data} categories={CONTRIBUTION_CATEGORIES}
          initial={emptyDraft("CHANDA", contributionFor)} isPending={isPending}
          onCancel={() => setContributionFor(null)}
          onSubmit={(input) => execute({
            serverAction: () => addContribution(input),
            successMsg: "Contribution added",
            // History is re-fetched whenever a row is expanded again
            onSuccess: () => { setExpanded(null); setContributionFor(null); },
          })}
        />
      )}

      {profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setProfile(null)}>
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{profile.id ? "Edit Contributor" : "New Contributor"}</h2>
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
              {!profile.id && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={profile.isAnonymous} onChange={(e) => setProfile({ ...profile, isAnonymous: e.target.checked })} />
                  <span className="font-bold">Anonymous contributor</span>
                </label>
              )}
              {profile.id && <p className="text-xs text-muted-foreground">Name and phone changes are applied to all of this person&apos;s contributions and receipts.</p>}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={() => setProfile(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search contributors by name, phone or notes…" shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">Contributor</th>
                <th className="px-4 py-3">Contributions</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Public name</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {search && visible.length === 0 && data.length > 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</td></tr>}
              {data.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No contributors yet. They are created when you add a chanda or donation.</td></tr>}
              {visible.map((c) => {
                const rows = history[c.id];
                return (
                  <Fragment key={c.id}>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => toggleHistory(c.id)} aria-label="Show contributions" aria-expanded={expanded === c.id} className="p-0.5 rounded hover:bg-muted text-muted-foreground">
                            {expanded === c.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <span className="font-bold">{c.name}</span>
                          <button onClick={() => setContributionFor(c.id)} disabled={isPending} title={`Add Contribution for ${c.name}`}
                            className="ml-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-primary border border-primary/30 hover:bg-primary/10 inline-flex items-center gap-1 disabled:opacity-50">
                            <CirclePlus className="w-3.5 h-3.5" /> Add Contribution
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{c.phone || "No phone"}{c.notes ? ` · ${c.notes}` : ""}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.count}{c.lastDate ? <span className="block text-[10px]">last {c.lastDate}</span> : null}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{inr(c.total)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleAnonymous(c)} disabled={isPending} title="Applies to ALL of this person's contributions, past and future"
                          className={"px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 inline-flex items-center gap-1 " + (c.isAnonymous ? "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                          {c.isAnonymous ? <UserX className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {c.isAnonymous ? "ANONYMOUS" : "NAMED"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setProfile({ id: c.id, name: c.name, phone: c.phone ?? "", notes: c.notes ?? "", isAnonymous: c.isAnonymous })} disabled={isPending} aria-label="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c)} disabled={isPending || c.count > 0} aria-label="Delete" title={c.count > 0 ? "Has contributions — cannot delete" : "Delete"} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {expanded === c.id && (
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="px-4 py-3">
                          {rows === "loading" && <p className="text-xs text-muted-foreground">Loading…</p>}
                          {rows === "error" && <p className="text-xs text-red-600">Could not load contributions.</p>}
                          {Array.isArray(rows) && rows.length === 0 && <p className="text-xs text-muted-foreground">No contributions yet.</p>}
                          {Array.isArray(rows) && rows.length > 0 && (
                            <ul className="divide-y divide-border text-xs">
                              {rows.map((r) => (
                                <li key={r.id} className="py-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                  <span className="font-mono text-muted-foreground w-24">{r.date || "-"}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 font-bold">{r.category}</span>
                                  <span className="font-bold text-emerald-600">{inr(r.amount)}</span>
                                  <span className="text-muted-foreground">{r.purpose}</span>
                                  <span className={r.isPublished ? "text-emerald-600 font-bold" : "text-stone-500 font-bold"}>{r.isPublished ? "PUBLISHED" : "DRAFT"}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

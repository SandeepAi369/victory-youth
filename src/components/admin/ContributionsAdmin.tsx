"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, User, UserX, CirclePlus } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";
import { ContributionForm, emptyDraft, today, type ContributionDraft, type ContributorOption } from "@/components/admin/ContributionForm";
import { addContribution, updateContribution, setContributorAnonymous } from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

export type ContributionEntry = {
  id: string; receiptNo: string | null; donorName: string; phone: string | null;
  amount: number; category: string | null; purpose: string | null; paymentMode: string | null;
  date: string | null; isPublished: boolean | null; isAnonymous: boolean | null; contributorId: string | null;
};

type Result = Promise<{ success: boolean; error?: string }>;

/** Admin list + add/edit for one kind of contribution (the Chanda and Donations pages). */
export function ContributionsAdmin({
  title, subtitle, noun, categories, showCategory, initialData, contributors, actions,
}: {
  title: string; subtitle: string; noun: string;
  categories: readonly ContributionCategory[];
  showCategory: boolean;
  initialData: ContributionEntry[];
  contributors: ContributorOption[];
  actions: {
    remove: (id: string) => Result;
    togglePublish: (id: string, publish: boolean) => Result;
    setAllVisibility: (publish: boolean) => Promise<{ success: boolean; newState: boolean; error?: string }>;
  };
}) {
  const { data, isPending, execute } = useAdminAction<ContributionEntry>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (e) => [e.donorName, e.receiptNo, e.phone, e.purpose, e.category, e.paymentMode]);
  const [form, setForm] = useState<{ editingId: string | null; draft: ContributionDraft } | null>(null);

  const isAllPublished = data.length > 0 && data.every((e) => e.isPublished);
  // Each row's isAnonymous is a synced copy of its contributor's flag
  const anonymousOf = (e: ContributionEntry) => !!e.isAnonymous;

  const openNew = (contributorId: string | null = null) => setForm({ editingId: null, draft: emptyDraft(categories[0], contributorId) });
  const openEdit = (e: ContributionEntry) => setForm({
    editingId: e.id,
    draft: { contributorId: e.contributorId, category: e.category || categories[0], amount: String(e.amount), paymentMode: e.paymentMode || "CASH", date: e.date || today(), purpose: e.purpose || "" },
  });

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((d) => ({ ...d, isPublished: newState })),
      serverAction: () => actions.setAllVisibility(newState),
      successMsg: newState ? `All ${noun} entries published` : `All ${noun} entries unpublished`,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this entry?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((d) => d.id !== id),
      serverAction: () => actions.remove(id),
      successMsg: "Deleted",
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.id === id ? { ...d, isPublished: !current } : d),
      serverAction: () => actions.togglePublish(id, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  /** Anonymity belongs to the contributor: every row of that person flips together. */
  const handleToggleAnonymous = (e: ContributionEntry) => {
    if (!e.contributorId) return;
    const next = !anonymousOf(e);
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.contributorId === e.contributorId ? { ...d, isAnonymous: next } : d),
      serverAction: () => setContributorAnonymous(e.contributorId!, next),
      successMsg: next ? `${e.donorName} is now anonymous on all contributions` : `${e.donorName}'s name is now shown on all contributions`,
    });
  };

  const btn = (extra: string) => "px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-all " + (isPending ? "opacity-50 cursor-not-allowed pointer-events-none " : "") + extra;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm">{subtitle} · Total: ₹{data.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {data.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={btn("font-bold border " + (isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"))}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <div className="w-px h-6 bg-border" />
          <button onClick={() => openNew()} disabled={isPending} className={btn("font-medium bg-primary text-primary-foreground hover:opacity-90")}>
            <Plus className="w-4 h-4" /> Add {noun}
          </button>
        </div>
      </div>

      {form && (
        <ContributionForm
          title={form.editingId ? `Edit ${noun}` : `New ${noun}`}
          contributors={contributors} categories={categories} initial={form.draft} isPending={isPending}
          onCancel={() => setForm(null)}
          onSubmit={(input) => execute({
            serverAction: () => form.editingId ? updateContribution(form.editingId, input) : addContribution(input),
            successMsg: form.editingId ? "Updated" : `${noun} added`,
            onSuccess: () => setForm(null),
          })}
        />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder={`Search ${noun.toLowerCase()} by name, receipt no., phone or purpose…`} shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">Contributor</th>
                <th className="px-4 py-3">Amount</th>
                {showCategory && <th className="px-4 py-3">Category</th>}
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {search && visible.length === 0 && data.length > 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</td></tr>}
              {data.length === 0 && <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No {noun.toLowerCase()} entries yet.</td></tr>}
              {visible.map((e) => {
                const anonymous = anonymousOf(e);
                return (
                  <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-foreground">{e.donorName}</p>
                        {e.contributorId && (
                          <button onClick={() => openNew(e.contributorId)} disabled={isPending} title={`Add another contribution for ${e.donorName}`} aria-label={`Add contribution for ${e.donorName}`}
                            className="p-0.5 text-primary hover:bg-primary/10 rounded-md disabled:opacity-50">
                            <CirclePlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {anonymous && <p className="text-[10px] font-bold text-violet-600 flex items-center gap-1"><UserX className="w-3 h-3" /> Anonymous on public site</p>}
                      {e.receiptNo && <p className="text-[10px] text-muted-foreground font-mono">{e.receiptNo}</p>}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{e.amount?.toLocaleString("en-IN")}</td>
                    {showCategory && <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">{e.category}</span></td>}
                    <td className="px-4 py-3 text-muted-foreground text-xs">{e.date || "-"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleTogglePublish(e.id, !!e.isPublished)} disabled={isPending}
                        className={"px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 " + (e.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                        {e.isPublished ? "PUBLISHED" : "DRAFT"}
                      </button>
                      <button onClick={() => handleToggleAnonymous(e)} disabled={isPending || !e.contributorId} title="Hide or show this person's name on ALL their contributions"
                        className={"ml-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 inline-flex items-center gap-1 " + (anonymous ? "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                        {anonymous ? <UserX className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {anonymous ? "ANONYMOUS" : "NAMED"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(e)} disabled={isPending} aria-label="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(e.id)} disabled={isPending} aria-label="Delete" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

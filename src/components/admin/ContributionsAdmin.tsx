"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, CirclePlus } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";
import { ContributionForm, emptyDraft, today, type ContributionDraft, type ContributorOption } from "@/components/admin/ContributionForm";
import { PublishSwitch, AnonymousMark } from "@/components/admin/ContributionControls";
import {
  addContribution, updateContribution, deleteContribution,
  setContributionPublished, setAllContributionsPublished,
} from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

export type ContributionEntry = {
  id: string; receiptNo: string | null; donorName: string; phone: string | null;
  amount: number; category: string | null; purpose: string | null; paymentMode: string | null;
  date: string | null; isPublished: boolean | null; isAnonymous: boolean | null; contributorId: string | null;
};

/**
 * Admin list + add/edit for ONE category (the Chanda and Donations pages).
 * Every action is scoped to that category on the server as well.
 */
export function ContributionsAdmin({
  title, subtitle, noun, category, initialData, contributors,
}: {
  title: string; subtitle: string; noun: string;
  /** The one category this page records — there is no category choice */
  category: ContributionCategory;
  initialData: ContributionEntry[];
  contributors: ContributorOption[];
}) {
  const { data, isPending, execute } = useAdminAction<ContributionEntry>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (e) => [e.donorName, e.receiptNo, e.phone, e.purpose, e.paymentMode]);
  const [form, setForm] = useState<{ editing: ContributionEntry | null; draft: ContributionDraft } | null>(null);

  const isAllPublished = data.length > 0 && data.every((e) => e.isPublished);
  const total = data.reduce((sum, e) => sum + (e.amount || 0), 0);
  const publishedCount = data.filter((e) => e.isPublished).length;

  const openNew = (contributorId: string | null = null) => setForm({ editing: null, draft: emptyDraft(contributorId) });
  const openEdit = (e: ContributionEntry) => setForm({
    editing: e,
    // In edit mode the amount box is the amount to ADD, so it starts empty
    draft: { contributorId: e.contributorId, amount: "", paymentMode: e.paymentMode || "CASH", date: e.date || today(), purpose: e.purpose || "" },
  });

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((d) => ({ ...d, isPublished: newState })),
      serverAction: () => setAllContributionsPublished(category, newState),
      successMsg: newState ? `All ${noun} entries published` : `All ${noun} entries unpublished`,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this entry?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((d) => d.id !== id),
      serverAction: () => deleteContribution(id, category),
      successMsg: "Deleted",
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.id === id ? { ...d, isPublished: !current } : d),
      serverAction: () => setContributionPublished(id, category, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  const btn = (extra: string) => "px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-all " + (isPending ? "opacity-50 cursor-not-allowed pointer-events-none " : "") + extra;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {subtitle} · Total: ₹{total.toLocaleString("en-IN")} · {publishedCount}/{data.length} published
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {data.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending} title={`Publish or unpublish ALL ${noun.toLowerCase()} entries`}
              className={btn("font-bold border " + (isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"))}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "All Published" : "Publish All"}
            </button>
          )}
          <button onClick={() => openNew()} disabled={isPending} className={btn("font-medium bg-primary text-primary-foreground hover:opacity-90")}>
            <Plus className="w-4 h-4" /> Add {noun}
          </button>
        </div>
      </div>

      {form && (
        <ContributionForm
          title={form.editing ? `Edit ${noun}` : `New ${noun}`}
          contributors={contributors} category={category} initial={form.draft}
          currentAmount={form.editing ? form.editing.amount : undefined} isPending={isPending}
          onCancel={() => setForm(null)}
          onSubmit={({ amount, ...input }) => execute({
            serverAction: () => form.editing
              ? updateContribution(form.editing.id, { ...input, addAmount: amount })
              : addContribution({ ...input, amount }),
            successMsg: form.editing ? (amount > 0 ? `₹${amount.toLocaleString("en-IN")} added` : "Updated") : `${noun} added`,
            onSuccess: () => setForm(null),
          })}
        />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder={`Search ${noun.toLowerCase()} by name, receipt no., phone or purpose…`} shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl shadow-sm">
        <div className="hidden md:grid grid-cols-[1fr_7rem_18rem] gap-4 px-4 py-3 bg-muted/50 text-muted-foreground text-sm font-medium border-b rounded-t-2xl">
          <span>Contributor</span><span className="text-right">Amount</span><span className="text-right">Publish · Anonymous · Actions</span>
        </div>
        <ul className="divide-y divide-border">
          {search && visible.length === 0 && data.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {data.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No {noun.toLowerCase()} entries yet.</li>}
          {visible.map((e) => (
            <li key={e.id} className="px-4 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_7rem_18rem] items-center gap-x-4 gap-y-2 hover:bg-muted/40 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-foreground truncate">{e.donorName}</p>
                  {e.contributorId && (
                    <button onClick={() => openNew(e.contributorId)} disabled={isPending} title={`Add another ${noun.toLowerCase()} for ${e.donorName}`} aria-label={`Add contribution for ${e.donorName}`}
                      className="p-0.5 text-primary hover:bg-primary/10 rounded-md disabled:opacity-50 shrink-0">
                      <CirclePlus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {e.date || "-"} · {(e.paymentMode || "").replace("_", " ")}{e.purpose ? ` · ${e.purpose}` : ""}
                </p>
                {e.receiptNo && <p className="text-[10px] text-muted-foreground font-mono">{e.receiptNo}</p>}
              </div>
              <p className="font-black text-emerald-600 text-right">₹{e.amount?.toLocaleString("en-IN")}</p>
              {/* Controls: always on screen (their own row on phones) */}
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                <PublishSwitch published={!!e.isPublished} disabled={isPending} onToggle={() => handleTogglePublish(e.id, !!e.isPublished)} />
                <AnonymousMark anonymous={!!e.isAnonymous} />
                <button onClick={() => openEdit(e)} disabled={isPending} aria-label="Edit" title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(e.id)} disabled={isPending} aria-label="Delete" title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

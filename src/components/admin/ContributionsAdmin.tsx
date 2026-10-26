"use client";

import { Fragment, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, CirclePlus, ChevronDown, ChevronRight } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { ContributionForm, emptyDraft, today, type ContributionDraft, type ContributorOption } from "@/components/admin/ContributionForm";
import { PublishSwitch, AnonymousMark } from "@/components/admin/ContributionControls";
import { ProfileForm, type ProfileDraft } from "@/components/admin/ProfileForm";
import {
  addContribution, updateContribution, deleteContribution, updateContributor,
  setContributionPublished, setAllContributionsPublished, setPersonPublished,
} from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

export type ContributionEntry = {
  id: string; receiptNo: string | null; donorName: string; phone: string | null;
  amount: number; category: string | null; purpose: string | null; paymentMode: string | null;
  date: string | null; isPublished: boolean | null; isAnonymous: boolean | null; contributorId: string | null;
};

/** One person in the list, with all of their entries in this category. */
type Person = {
  key: string; contributorId: string | null; name: string; phone: string | null;
  anonymous: boolean; entries: ContributionEntry[]; total: number; lastDate: string | null; allPublished: boolean;
};

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/**
 * Admin list + add/edit for ONE category (the Chanda and Donations pages).
 * Each person appears ONCE (name, number of entries, total); clicking the name
 * opens their itemized entries, each with its own Publish / Edit / Delete.
 * Every action is scoped to this category on the server as well.
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<{ editing: ContributionEntry | null; draft: ContributionDraft } | null>(null);
  const [profile, setProfile] = useState<ProfileDraft | null>(null);
  const unit = noun.toLowerCase();

  // Group entries by person (server order = newest first, so people are newest-first too)
  const people = useMemo(() => {
    const byKey = new Map<string, Person>();
    for (const e of data) {
      const key = e.contributorId ?? e.id;
      const profileRow = e.contributorId ? contributors.find((c) => c.id === e.contributorId) : undefined;
      const p = byKey.get(key) ?? {
        key, contributorId: e.contributorId, name: profileRow?.name ?? e.donorName, phone: profileRow?.phone ?? e.phone,
        anonymous: false, entries: [], total: 0, lastDate: null, allPublished: true,
      };
      p.entries.push(e);
      p.total += e.amount || 0;
      p.anonymous ||= !!e.isAnonymous;
      p.allPublished &&= !!e.isPublished;
      if (e.date && (!p.lastDate || e.date > p.lastDate)) p.lastDate = e.date;
      byKey.set(key, p);
    }
    return [...byKey.values()];
  }, [data, contributors]);

  const q = search.trim().toLowerCase();
  const visible = q
    ? people.filter((p) => [p.name, p.phone, ...p.entries.flatMap((e) => [e.receiptNo, e.purpose, e.paymentMode])]
      .some((v) => v?.toLowerCase().includes(q)))
    : people;

  // The global Publish/Unpublish button only ever touches NON-anonymous entries
  const named = data.filter((e) => !e.isAnonymous);
  const allNamedPublished = named.length > 0 && named.every((e) => e.isPublished);
  const total = data.reduce((sum, e) => sum + (e.amount || 0), 0);
  const publishedCount = data.filter((e) => e.isPublished).length;

  const openNew = (contributorId: string | null = null) => setForm({ editing: null, draft: emptyDraft(contributorId) });
  const openEdit = (e: ContributionEntry) => setForm({
    editing: e,
    // In edit mode the amount box is the amount to ADD (a new separate entry), so it starts empty
    draft: { contributorId: e.contributorId, amount: "", paymentMode: e.paymentMode || "CASH", date: e.date || today(), purpose: e.purpose || "" },
  });
  const openProfile = (p: Person) => {
    const c = contributors.find((x) => x.id === p.contributorId);
    setProfile({ id: p.contributorId, name: p.name, phone: p.phone ?? "", notes: c?.notes ?? "", isAnonymous: p.anonymous });
  };

  const handleMasterToggle = () => {
    const newState = !allNamedPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.isAnonymous ? d : { ...d, isPublished: newState }),
      serverAction: () => setAllContributionsPublished(category, newState),
      successMsg: newState ? `${noun} entries published (anonymous entries untouched)` : `${noun} entries unpublished (anonymous entries untouched)`,
    });
  };

  const handlePersonPublish = (p: Person) => {
    if (!p.contributorId) return;
    const next = !p.allPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.contributorId === p.contributorId && !d.isAnonymous ? { ...d, isPublished: next } : d),
      serverAction: () => setPersonPublished(p.contributorId!, category, next),
      successMsg: next ? `All of ${p.name}'s entries published` : `All of ${p.name}'s entries unpublished`,
    });
  };

  const handleEntryPublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.id === id ? { ...d, isPublished: !current } : d),
      serverAction: () => setContributionPublished(id, category, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  const handleDelete = (e: ContributionEntry) => {
    if (!confirm(`Permanently delete this ${inr(e.amount)} entry?`)) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((d) => d.id !== e.id),
      serverAction: () => deleteContribution(e.id, category),
      successMsg: "Deleted",
    });
  };

  const btn = (extra: string) => "px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-all " + (isPending ? "opacity-50 cursor-not-allowed pointer-events-none " : "") + extra;
  const icon = "p-1.5 rounded-lg disabled:opacity-50";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {subtitle} · Total: {inr(total)} · {people.length} people · {publishedCount}/{data.length} entries published
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {named.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              title={`${allNamedPublished ? "Unpublish" : "Publish"} every non-anonymous ${unit} entry. Anonymous entries are never affected.`}
              className={btn("font-bold border " + (allNamedPublished ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"))}>
              {allNamedPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {allNamedPublished ? "Unpublish" : "Publish"}
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
          currentAmount={form.editing ? people.find((p) => p.entries.some((e) => e.id === form.editing!.id))?.total ?? form.editing.amount : undefined}
          isPending={isPending}
          onCancel={() => setForm(null)}
          onSubmit={({ amount, ...input }) => execute({
            serverAction: () => form.editing
              ? updateContribution(form.editing.id, { ...input, addAmount: amount })
              : addContribution({ ...input, amount }),
            successMsg: form.editing ? (amount > 0 ? `₹${amount.toLocaleString("en-IN")} added as a new entry` : "Updated") : `${noun} added`,
            onSuccess: () => setForm(null),
          })}
        />
      )}

      {profile && (
        <ProfileForm category={category} initial={profile} isPending={isPending}
          onCancel={() => setProfile(null)}
          onSubmit={({ id, ...fields }) => id && execute({
            serverAction: () => updateContributor(id, fields),
            successMsg: "Contributor updated",
            onSuccess: () => setProfile(null),
          })} />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder={`Search ${unit} by name, phone, receipt no. or purpose…`} shown={visible.length} total={people.length} />

      <div className="bg-card border rounded-2xl shadow-sm">
        <div className="hidden md:grid grid-cols-[1fr_7rem_18rem] gap-4 px-4 py-3 bg-muted/50 text-muted-foreground text-sm font-medium border-b rounded-t-2xl">
          <span>Contributor</span><span className="text-right">Total</span><span className="text-right">Publish · Anonymous · Actions</span>
        </div>
        <ul className="divide-y divide-border">
          {q && visible.length === 0 && people.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {people.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No {unit} entries yet.</li>}
          {visible.map((p) => {
            const open = expanded === p.key;
            const count = p.entries.length;
            return (
              <Fragment key={p.key}>
                {/* One row per person */}
                <li data-person={p.name} className="px-4 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_7rem_18rem] items-center gap-x-4 gap-y-2 hover:bg-muted/40 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setExpanded(open ? null : p.key)} aria-expanded={open} aria-label={`Show ${p.name}'s entries`}
                        className="flex items-center gap-1 min-w-0 font-bold text-foreground hover:text-primary">
                        {open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                        <span className="truncate">{p.name}</span>
                      </button>
                      {p.contributorId && (
                        <button onClick={() => openNew(p.contributorId)} disabled={isPending} title={`Add another ${unit} for ${p.name}`} aria-label={`Add contribution for ${p.name}`}
                          className="p-0.5 text-primary hover:bg-primary/10 rounded-md disabled:opacity-50 shrink-0">
                          <CirclePlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate ml-5">
                      {count} {unit}{count === 1 ? "" : "s"}{p.lastDate ? ` · last ${p.lastDate}` : ""}{p.phone ? ` · ${p.phone}` : ""}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600 text-right">{inr(p.total)}</p>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                    <PublishSwitch published={p.allPublished} locked={p.anonymous} disabled={isPending || !p.contributorId} onToggle={() => handlePersonPublish(p)} />
                    <AnonymousMark anonymous={p.anonymous} />
                    <button onClick={() => p.contributorId ? openProfile(p) : openEdit(p.entries[0])} disabled={isPending} aria-label="Edit" title="Edit contributor"
                      className={icon + " text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"}><Pencil className="w-4 h-4" /></button>
                    {/* Deleting happens per entry, inside the person's list */}
                    <span className="w-7" aria-hidden />
                  </div>
                </li>

                {/* Itemized entries — only after clicking the name */}
                {open && (
                  <li className="bg-muted/30 px-4 py-2">
                    <ul className="divide-y divide-border" aria-label={`${p.name}'s ${unit} entries`}>
                      {p.entries.map((e) => (
                        <li key={e.id} className="py-2 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_7rem_18rem] items-center gap-x-4 gap-y-1.5">
                          <div className="min-w-0 pl-5">
                            <p className="text-xs font-bold">{e.date || "-"} <span className="font-normal text-muted-foreground">· {(e.paymentMode || "").replace("_", " ")}{e.purpose ? ` · ${e.purpose}` : ""}</span></p>
                            {e.receiptNo && <p className="text-[10px] text-muted-foreground font-mono">{e.receiptNo}</p>}
                          </div>
                          <p className="font-bold text-emerald-600 text-right text-sm">{inr(e.amount)}</p>
                          <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                            <PublishSwitch published={!!e.isPublished} locked={!!e.isAnonymous} disabled={isPending} onToggle={() => handleEntryPublish(e.id, !!e.isPublished)} />
                            <span className="w-5" aria-hidden />
                            <button onClick={() => openEdit(e)} disabled={isPending} aria-label="Edit entry" title="Edit entry" className={icon + " text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"}><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(e)} disabled={isPending} aria-label="Delete entry" title="Delete entry" className={icon + " text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </li>
                      ))}
                    </ul>
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

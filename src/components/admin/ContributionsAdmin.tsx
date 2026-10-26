"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { ContributionForm, emptyDraft, type ContributorOption } from "@/components/admin/ContributionForm";
import { AnonymousToggle } from "@/components/admin/ContributionControls";
import { addContribution, setAllContributionsPublished, setContributorAnonymous } from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

export type ContributionEntry = {
  id: string; receiptNo: string | null; donorName: string; phone: string | null;
  amount: number; category: string | null; purpose: string | null; paymentMode: string | null;
  date: string | null; isPublished: boolean | null; isAnonymous: boolean | null; contributorId: string | null;
};

/** One person in the list, with the summary of their entries in this category. */
type Person = {
  key: string; contributorId: string | null; name: string; phone: string | null;
  anonymous: boolean; entries: ContributionEntry[]; total: number; lastDate: string | null;
};

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/**
 * Admin list for ONE category (the Chanda and Donations pages): each person
 * appears ONCE (name, number of entries, total). Clicking a person opens their
 * own full-page profile (/admin/contributors/[id]) where their entries are
 * published, edited and deleted. Every action is category-scoped on the server.
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
  const [adding, setAdding] = useState(false);
  const unit = noun.toLowerCase();

  // Group entries by person (server order = newest first, so people are newest-first too)
  const people = useMemo(() => {
    const byKey = new Map<string, Person>();
    for (const e of data) {
      const key = e.contributorId ?? e.id;
      const profileRow = e.contributorId ? contributors.find((c) => c.id === e.contributorId) : undefined;
      const p = byKey.get(key) ?? {
        key, contributorId: e.contributorId, name: profileRow?.name ?? e.donorName, phone: profileRow?.phone ?? e.phone,
        anonymous: false, entries: [], total: 0, lastDate: null,
      };
      p.entries.push(e);
      p.total += e.amount || 0;
      p.anonymous ||= !!e.isAnonymous;
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

  const handleMasterToggle = () => {
    const newState = !allNamedPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.isAnonymous ? d : { ...d, isPublished: newState }),
      serverAction: () => setAllContributionsPublished(category, newState),
      successMsg: newState ? `${noun} entries published (anonymous entries untouched)` : `${noun} entries unpublished (anonymous entries untouched)`,
    });
  };

  const handleAnonymous = (p: Person) => {
    if (!p.contributorId) return;
    const next = !p.anonymous;
    execute({
      // Anonymous entries are admin-only, so ticking also unpublishes them
      optimisticUpdate: (prev) => prev.map((d) => d.contributorId === p.contributorId ? { ...d, isAnonymous: next, isPublished: next ? false : d.isPublished } : d),
      serverAction: () => setContributorAnonymous(p.contributorId!, next),
      successMsg: next ? `${p.name} is now anonymous — hidden from the public site` : `${p.name}'s name is public again (publish the entries to show them)`,
    });
  };

  const btn = (extra: string) => "px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-all " + (isPending ? "opacity-50 cursor-not-allowed pointer-events-none " : "") + extra;

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
          <button onClick={() => setAdding(true)} disabled={isPending} className={btn("font-medium bg-primary text-primary-foreground hover:opacity-90")}>
            <Plus className="w-4 h-4" /> Add {noun}
          </button>
        </div>
      </div>

      {adding && (
        <ContributionForm
          title={`New ${noun}`} contributors={contributors} category={category} initial={emptyDraft()} isPending={isPending}
          onCancel={() => setAdding(false)}
          onSubmit={(input) => execute({ serverAction: () => addContribution(input), successMsg: `${noun} added`, onSuccess: () => setAdding(false) })}
        />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder={`Search ${unit} by name, phone, receipt no. or purpose…`} shown={visible.length} total={people.length} />

      {/* One row per person — click to open their own profile page */}
      <div className="bg-card border rounded-2xl shadow-sm">
        <ul className="divide-y divide-border">
          {q && visible.length === 0 && people.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {people.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No {unit} entries yet.</li>}
          {visible.map((p) => {
            const count = p.entries.length;
            const body = (
              <>
                <div className="min-w-0">
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <span className="truncate">{p.name}</span>
                    {p.contributorId && <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {count} {unit}{count === 1 ? "" : "s"}{p.lastDate ? ` · last ${p.lastDate}` : ""}{p.phone ? ` · ${p.phone}` : ""}
                  </p>
                </div>
                <span className="font-black text-emerald-600 shrink-0 text-right">{inr(p.total)}</span>
              </>
            );
            const row = "group flex-1 min-w-0 pl-4 py-3 flex items-center justify-between gap-4";
            return (
              <li key={p.key} data-person={p.name} className="flex items-center gap-2 pr-3 hover:bg-muted/50 transition-colors">
                {p.contributorId ? (
                  <Link href={`/admin/contributors/${p.contributorId}`} className={row} aria-label={`Open ${p.name}'s profile`}>{body}</Link>
                ) : (
                  <div className={row}>{body}</div>
                )}
                {/* The tick is its own control — it never opens the profile */}
                {p.contributorId && <AnonymousToggle anonymous={p.anonymous} name={p.name} disabled={isPending} onToggle={() => handleAnonymous(p)} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, ChevronRight } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";
import { AnonymousToggle } from "@/components/admin/ContributionControls";
import { ProfileForm, type ProfileDraft } from "@/components/admin/ProfileForm";
import { createContributor, setContributorAnonymous } from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

type Contributor = {
  id: string; name: string; phone: string | null; isAnonymous: boolean; notes: string | null;
  count: number; total: number; lastDate: string | null;
};

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

const TABS: { category: ContributionCategory; label: string; href: string }[] = [
  { category: "CHANDA", label: "Chanda", href: "/admin/contributors" },
  { category: "DONATION", label: "Donations", href: "/admin/contributors?tab=donations" },
];

/**
 * Contributor profiles of ONE category (Chanda and Donations are separate tabs).
 * One row per person; clicking opens their own full-page profile.
 */
export default function ContributorsClient({ category, initialData }: { category: ContributionCategory; initialData: Contributor[] }) {
  const book = category === "CHANDA" ? "Chanda" : "Donations";
  const noun = category === "CHANDA" ? "chanda" : "donation";
  const { data, isPending, execute } = useAdminAction<Contributor>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (c) => [c.name, c.phone, c.notes]);
  const [creating, setCreating] = useState<ProfileDraft | null>(null);

  const handleAnonymous = (c: Contributor) => {
    const next = !c.isAnonymous;
    execute({
      optimisticUpdate: (prev) => prev.map((x) => x.id === c.id ? { ...x, isAnonymous: next } : x),
      serverAction: () => setContributorAnonymous(c.id, next),
      successMsg: next ? `${c.name} is now anonymous — hidden from the public site` : `${c.name}'s name is public again (publish the entries to show them)`,
    });
  };

  const totalAmount = data.reduce((s, c) => s + Number(c.total || 0), 0);
  const anonymousCount = data.filter((c) => c.isAnonymous).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contributors</h1>
          <p className="text-muted-foreground text-sm">
            {book}: {data.length} profiles · {anonymousCount} anonymous · {inr(totalAmount)} in total
          </p>
        </div>
        <button onClick={() => setCreating({ id: null, name: "", phone: "", notes: "", isAnonymous: false })} disabled={isPending}
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

      {creating && (
        <ProfileForm category={category} initial={creating} isPending={isPending}
          onCancel={() => setCreating(null)}
          onSubmit={({ name, phone, notes, isAnonymous }) => execute({
            serverAction: () => createContributor({ name, phone, notes, isAnonymous, category }),
            successMsg: "Contributor added",
            onSuccess: () => setCreating(null),
          })} />
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder={`Search ${book.toLowerCase()} contributors by name, phone or notes…`} shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl shadow-sm">
        <ul className="divide-y divide-border">
          {search && visible.length === 0 && data.length > 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</li>}
          {data.length === 0 && <li className="px-4 py-12 text-center text-muted-foreground">No {book.toLowerCase()} contributors yet. They are created when you add a {noun}.</li>}
          {visible.map((c) => (
            <li key={c.id} data-person={c.name} className="flex items-center gap-2 pr-3 hover:bg-muted/50 transition-colors">
              <Link href={`/admin/contributors/${c.id}?from=contributors`} aria-label={`Open ${c.name}'s profile`}
                className="group flex-1 min-w-0 pl-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold flex items-center gap-1">
                    <span className="truncate">{c.name}</span>
                    <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.count} {noun}{c.count === 1 ? "" : "s"}{c.lastDate ? ` · last ${c.lastDate}` : ""} · {c.phone || "No phone"}{c.notes ? ` · ${c.notes}` : ""}
                  </p>
                </div>
                <span className="font-black text-emerald-600 shrink-0 text-right">{inr(c.total)}</span>
              </Link>
              {/* The tick is its own control — it never opens the profile */}
              <AnonymousToggle anonymous={c.isAnonymous} name={c.name} disabled={isPending} onToggle={() => handleAnonymous(c)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

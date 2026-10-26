"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Lock, Phone, StickyNote } from "lucide-react";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { ContributionForm, emptyDraft, today, type ContributionDraft, type ContributorOption } from "@/components/admin/ContributionForm";
import { AnonymousMark } from "@/components/admin/ContributionControls";
import { ProfileForm, type ProfileDraft } from "@/components/admin/ProfileForm";
import type { ContributionEntry } from "@/components/admin/ContributionsAdmin";
import {
  addContribution, updateContribution, deleteContribution, updateContributor, deleteContributor,
} from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";

type Profile = {
  id: string; name: string; phone: string | null; notes: string | null; isAnonymous: boolean; category: ContributionCategory;
};

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/** One person's own page: their details, totals and every entry — nobody else's. */
export default function ProfileClient({ profile, initialEntries, contributors, back }: {
  profile: Profile;
  initialEntries: ContributionEntry[];
  contributors: ContributorOption[];
  back: { href: string; label: string };
}) {
  const router = useRouter();
  const { data, isPending, execute } = useAdminAction<ContributionEntry>(initialEntries);
  const [form, setForm] = useState<{ editing: ContributionEntry | null; draft: ContributionDraft } | null>(null);
  const [editingProfile, setEditingProfile] = useState<ProfileDraft | null>(null);
  const category = profile.category;
  const noun = category === "CHANDA" ? "Chanda" : "Donation";
  const unit = noun.toLowerCase();

  const total = data.reduce((s, e) => s + (e.amount || 0), 0);
  const lastDate = data.map((e) => e.date).filter(Boolean).sort().at(-1);

  const handleDelete = (e: ContributionEntry) => {
    if (!confirm(`Permanently delete this ${inr(e.amount)} entry?`)) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((d) => d.id !== e.id),
      serverAction: () => deleteContribution(e.id, category),
      successMsg: "Deleted",
    });
  };
  const handleDeleteProfile = () => {
    if (!confirm(`Delete the profile of ${profile.name}?`)) return;
    execute({
      serverAction: () => deleteContributor(profile.id),
      successMsg: "Contributor deleted",
      onSuccess: () => router.push(back.href),
    });
  };
  const openEdit = (e: ContributionEntry) => setForm({
    editing: e,
    draft: { contributorId: e.contributorId, amount: "", paymentMode: e.paymentMode || "CASH", date: e.date || today(), purpose: e.purpose || "" },
  });

  const btn = "px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-bold border transition-all disabled:opacity-50";

  return (
    <div className="space-y-6">
      <Link href={back.href} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> {back.label}
      </Link>

      {/* Header: who this is */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shrink-0">{profile.name[0]}</div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{noun} contributor</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone || "No phone"}</span>
                {profile.notes && <span className="inline-flex items-center gap-1"><StickyNote className="w-3.5 h-3.5" /> {profile.notes}</span>}
                <span className="inline-flex items-center gap-1.5"><AnonymousMark anonymous={profile.isAnonymous} /> {profile.isAnonymous ? "Anonymous — admin only" : "Public name"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setForm({ editing: null, draft: emptyDraft(profile.id) })} disabled={isPending}
              className="px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Plus className="w-4 h-4" /> Add {noun}
            </button>
            <button onClick={() => setEditingProfile({ id: profile.id, name: profile.name, phone: profile.phone ?? "", notes: profile.notes ?? "", isAnonymous: profile.isAnonymous })}
              disabled={isPending} className={btn + " bg-card hover:bg-muted"}>
              <Pencil className="w-4 h-4" /> Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* Totals for this person only */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Total ({unit})</p><p className="text-2xl font-black text-emerald-600">{inr(total)}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Entries</p><p className="text-2xl font-black">{data.length}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Last entry</p><p className="text-lg font-bold">{lastDate || "—"}</p></div>
      </div>

      {/* Every entry of this person */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b">
          <h2 className="font-bold">{noun} entries</h2>
          {profile.isAnonymous && data.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Anonymous — hidden from the public site</span>
          )}
        </div>
        <ul className="divide-y divide-border" aria-label={`${profile.name}'s ${unit} entries`}>
          {data.length === 0 && (
            <li className="px-4 py-10 text-center text-muted-foreground text-sm">
              No {unit} entries yet.
              <button onClick={handleDeleteProfile} disabled={isPending} className="block mx-auto mt-3 text-red-600 font-bold hover:underline">Delete this profile</button>
            </li>
          )}
          {data.map((e) => (
            <li key={e.id} className="px-4 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_8rem_auto] items-center gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="font-bold">{e.date || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{(e.paymentMode || "").replace("_", " ")}{e.purpose ? ` · ${e.purpose}` : ""}</p>
                {e.receiptNo && <p className="text-[10px] text-muted-foreground font-mono">{e.receiptNo}</p>}
              </div>
              <p className="font-black text-emerald-600 text-right">{inr(e.amount)}</p>
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                <button onClick={() => openEdit(e)} disabled={isPending} aria-label="Edit entry" title="Edit entry" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(e)} disabled={isPending} aria-label="Delete entry" title="Delete entry" className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {form && (
        <ContributionForm
          title={form.editing ? `Edit ${noun}` : `New ${noun} — ${profile.name}`}
          contributors={contributors} category={category} initial={form.draft}
          currentAmount={form.editing ? total : undefined} isPending={isPending}
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

      {editingProfile && (
        <ProfileForm category={category} initial={editingProfile} isPending={isPending}
          onCancel={() => setEditingProfile(null)}
          onSubmit={({ id, ...fields }) => id && execute({
            serverAction: () => updateContributor(id, fields),
            successMsg: "Profile updated",
            onSuccess: () => setEditingProfile(null),
          })} />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ContributionCategory } from "@/lib/contributions";

export type ProfileDraft = { id: string | null; name: string; phone: string; notes: string; isAnonymous: boolean };

/** Create / edit one contributor profile of a category (name, phone, notes, anonymous). */
export function ProfileForm({ category, initial, isPending, onCancel, onSubmit }: {
  category: ContributionCategory;
  initial: ProfileDraft;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (profile: ProfileDraft) => void;
}) {
  const [profile, setProfile] = useState(initial);
  const book = category === "CHANDA" ? "Chanda" : "Donations";
  const input = "w-full bg-background border rounded-lg px-3 py-2";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{profile.id ? `Edit ${book} Contributor` : `New ${book} Contributor`}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(profile); }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1" htmlFor="profile-name">Name *</label>
            <input id="profile-name" type="text" required autoFocus value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={input} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1" htmlFor="profile-phone">Phone</label>
            <input id="profile-phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={input} placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1" htmlFor="profile-notes">Notes (admin only)</label>
            <input id="profile-notes" type="text" value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} className={input} placeholder="e.g. Pays chanda monthly" />
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={profile.isAnonymous} onChange={(e) => setProfile({ ...profile, isAnonymous: e.target.checked })} className="mt-0.5" />
            <span>
              <span className="font-bold">Anonymous contributor</span>
              <span className="block text-xs text-muted-foreground">All of this profile&apos;s {book.toLowerCase()} entries stay in the admin panel only — never shown on the public site.</span>
            </span>
          </label>
          {profile.id && <p className="text-xs text-muted-foreground">Changes apply to all of this profile&apos;s {book.toLowerCase()} entries and receipts.</p>}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
            <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

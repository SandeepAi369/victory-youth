"use client";

import { Eye, EyeOff, Lock, SquareCheck, Square } from "lucide-react";

/**
 * Clearly labelled publish on/off switch for one money entry. `locked` (an
 * anonymous entry) shows it as unpublished and unclickable: anonymous entries
 * stay in the admin panel until Anonymous is unticked in Edit.
 */
export function PublishSwitch({ published, disabled, locked, onToggle }: { published: boolean; disabled?: boolean; locked?: boolean; onToggle: () => void }) {
  if (locked) published = false;
  return (
    <button type="button" role="switch" aria-checked={published} onClick={onToggle} disabled={disabled || locked}
      title={locked ? "Anonymous — admin only. Untick Anonymous in Edit to publish." : published ? "Published — click to unpublish" : "Unpublished — click to publish"}
      className={"inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors disabled:opacity-50 " +
        (published ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
          : "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600")}>
      <span className={"relative inline-flex h-4 w-7 rounded-full transition-colors " + (published ? "bg-emerald-500" : "bg-stone-400")}>
        <span className={"absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all " + (published ? "left-3.5" : "left-0.5")} />
      </span>
      {locked ? <Lock className="w-3.5 h-3.5" aria-hidden /> : published ? <Eye className="w-3.5 h-3.5" aria-hidden /> : <EyeOff className="w-3.5 h-3.5" aria-hidden />}
      {published ? "Published" : "Unpublished"}
    </button>
  );
}

/**
 * Anonymous indicator only (no text): ticked = anonymous, empty = public.
 * The setting itself is changed in the Edit screen.
 */
export function AnonymousMark({ anonymous }: { anonymous: boolean }) {
  const label = anonymous ? "Anonymous" : "Public name";
  return anonymous
    ? <SquareCheck className="w-5 h-5 text-violet-600 shrink-0" role="img" aria-label={label}><title>{label}</title></SquareCheck>
    : <Square className="w-5 h-5 text-stone-400 shrink-0" role="img" aria-label={label}><title>{label}</title></Square>;
}

/**
 * The list tick as a real control (outside the row's profile link): ticked =
 * anonymous (admin only, entries unpublished), empty = public name.
 */
export function AnonymousToggle({ anonymous, name, disabled, onToggle }: { anonymous: boolean; name: string; disabled?: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={anonymous} onClick={onToggle} disabled={disabled}
      aria-label={`Anonymous: ${name}`}
      title={anonymous ? `${name} is anonymous (admin only) — click to show the name again` : `Click to make ${name} anonymous (hidden from the public site)`}
      className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 shrink-0">
      {anonymous ? <SquareCheck className="w-5 h-5 text-violet-600" aria-hidden /> : <Square className="w-5 h-5 text-stone-400" aria-hidden />}
    </button>
  );
}

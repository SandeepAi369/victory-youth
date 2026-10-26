"use client";

import { SquareCheck, Square } from "lucide-react";

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

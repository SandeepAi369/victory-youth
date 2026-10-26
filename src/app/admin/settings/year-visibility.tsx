"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Save } from "lucide-react";
import { setPublicYears } from "@/lib/actions/admin";
import { describeYears } from "@/lib/contributions";

/**
 * Chooses which years' chanda, donations and events the public site shows.
 * Works together with each entry's Published switch: an entry is public only
 * when it is published AND its year is selected.
 */
export default function YearVisibility({ years, initial }: { years: number[]; initial: number[] | "ALL" }) {
  const [allYears, setAllYears] = useState(initial === "ALL");
  const [selected, setSelected] = useState<number[]>(initial === "ALL" ? [] : initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const options = [...new Set([...years, ...selected])].sort((a, b) => b - a);

  const toggle = (year: number) => {
    setAllYears(false);
    setSelected((s) => (allYears ? [year] : s.includes(year) ? s.filter((y) => y !== year) : [...s, year]));
  };

  const save = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await setPublicYears(allYears ? "ALL" : selected);
      setMessage(result.success
        ? { ok: true, text: allYears ? "✅ Public site now shows all years" : `✅ Public site now shows only ${[...selected].sort().join(", ")}` }
        : { ok: false, text: `❌ Could not save: ${"error" in result ? result.error : "unknown error"}` });
    });
  };

  const chip = (active: boolean) =>
    "px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors " +
    (active ? "bg-amber-500 text-zinc-950 border-amber-400" : "bg-black/60 text-zinc-300 border-red-900 hover:border-amber-500");

  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-red-950 space-y-4 max-w-4xl">
      <div className="pb-2 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Public Year Visibility</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Choose which years of Chanda, Donations and Events appear on the public site (default: the current year).
          Only entries that are <b>Published</b> and from a selected year are shown, and public totals count only
          those years. The admin panel always shows the complete ledger.
        </p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Visible years">
        <button type="button" onClick={() => { setAllYears(true); setSelected([]); }} aria-pressed={allYears} className={chip(allYears)}>All Years</button>
        {options.map((year) => (
          <label key={year} className={chip(!allYears && selected.includes(year)) + " cursor-pointer inline-flex items-center gap-1.5"}>
            <input type="checkbox" checked={!allYears && selected.includes(year)} onChange={() => toggle(year)} className="accent-zinc-950" />
            {year}
          </label>
        ))}
      </div>
      {message && <p className={"text-xs font-bold " + (message.ok ? "text-emerald-300" : "text-red-300")}>{message.text}</p>}
      <p className="text-xs text-zinc-300">
        Public pages will be labelled:{" "}
        <span className="inline-block rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 font-bold text-amber-300">
          {allYears ? "All Years" : selected.length ? `Total for ${describeYears(selected)}` : "—"}
        </span>
        <span className="block mt-1 text-zinc-500">Contributor profile pages always show each person&apos;s complete all-time history and total.</span>
      </p>
      {!allYears && selected.length === 0 && <p className="text-xs text-amber-300">Select at least one year, or All Years.</p>}
      <button type="button" onClick={save} disabled={isPending || (!allYears && selected.length === 0)}
        className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-60">
        <Save className="w-4 h-4" /> {isPending ? "Saving..." : "Save Year Visibility"}
      </button>
    </div>
  );
}

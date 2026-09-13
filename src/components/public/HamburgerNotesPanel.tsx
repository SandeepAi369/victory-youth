"use client";

import { useState } from "react";
import { Menu, X, StickyNote, ChevronRight, ChevronDown } from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: any;
  category?: string | null;
  authorName: string;
  createdAt?: Date | null;
};

export function HamburgerNotesPanel({ notes = [] }: { notes: Note[] }) {
  const [open, setOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const safeNotes = Array.isArray(notes) ? notes : [];

  return (
    <>
      {/* ☰ Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-stone-600 dark:text-stone-300" />
      </button>

      {/* Backdrop — dark overlay */}
      <div
        className={
          "fixed inset-0 z-[90] bg-black/70 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0 pointer-events-none")
        }
        onClick={() => setOpen(false)}
      />

      {/* ──────── PREMIUM SLIDING PANEL ──────── */}
      <div
        className={
          "fixed top-0 left-0 z-[100] h-full w-[50vw] min-w-[280px] max-w-[400px] " +
          "bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 " +
          "shadow-[4px_0_25px_rgba(0,0,0,0.15)] dark:shadow-[4px_0_25px_rgba(0,0,0,0.5)] " +
          "flex flex-col " +
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white text-lg font-black">V</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">Menu</h2>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">Victory Youth</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-stone-200 dark:via-stone-700 to-transparent" />

        {/* ── Menu List ── */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-6">
          <p className="px-3 mb-3 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.15em]">
            Features
          </p>

          {/* ━━━ NOTES ITEM — ALWAYS VISIBLE ━━━ */}
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className={
              "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all duration-200 " +
              (notesOpen
                ? "bg-orange-500/10 dark:bg-orange-500/10"
                : "hover:bg-stone-100 dark:hover:bg-stone-800/60")
            }
          >
            <div className="flex items-center gap-3.5">
              <div className={
                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors " +
                (notesOpen
                  ? "bg-orange-500 shadow-md shadow-orange-500/30"
                  : "bg-stone-100 dark:bg-stone-800")
              }>
                <StickyNote className={
                  "w-[18px] h-[18px] " +
                  (notesOpen ? "text-white" : "text-stone-500 dark:text-stone-400")
                } />
              </div>
              <div>
                <span className={
                  "text-sm font-bold block " +
                  (notesOpen ? "text-orange-600 dark:text-orange-400" : "text-stone-800 dark:text-stone-200")
                }>Notes</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                  {safeNotes.length > 0 ? safeNotes.length + " published" : "Committee updates"}
                </span>
              </div>
            </div>
            <div className={
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all " +
              (notesOpen ? "bg-orange-500/20 rotate-0" : "bg-transparent")
            }>
              {notesOpen
                ? <ChevronDown className="w-4 h-4 text-orange-500" />
                : <ChevronRight className="w-4 h-4 text-stone-400" />
              }
            </div>
          </button>

          {/* ━━━ NOTES EXPANDED CONTENT ━━━ */}
          <div className={
            "overflow-hidden transition-all duration-300 " +
            (notesOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0")
          }>
            <div className="ml-5 pl-4 border-l-2 border-orange-300 dark:border-orange-700 space-y-2.5 pb-2">
              {safeNotes.length === 0 ? (
                <div className="py-5 text-center">
                  <StickyNote className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    No published notes available at the moment.
                  </p>
                </div>
              ) : (
                safeNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {note.category && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[9px] font-bold uppercase mb-2">
                        {note.category}
                      </span>
                    )}
                    <h4 className="font-bold text-[13px] text-stone-900 dark:text-white leading-snug">
                      {note.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      {typeof note.content === "string"
                        ? note.content
                        : JSON.stringify(note.content)}
                    </p>
                    <p className="text-[9px] text-stone-400 dark:text-stone-600 mt-2 font-medium">
                      — {note.authorName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-stone-200/50 dark:border-stone-800/50">
          <p className="text-[10px] text-stone-400 dark:text-stone-600 text-center font-medium">
            Victory Youth Association · Est. 1974
          </p>
        </div>
      </div>
    </>
  );
}

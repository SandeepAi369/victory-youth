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

export function HamburgerNotesPanel({ notes }: { notes: Note[] }) {
  const [open, setOpen] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  return (
    <>
      {/* ☰ Button — icon only, no text */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-stone-600 dark:text-stone-300" />
      </button>

      {/* Dark Backdrop */}
      <div
        className={
          "fixed inset-0 z-[90] bg-black/70 transition-opacity duration-300 " +
          (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
        onClick={() => setOpen(false)}
      />

      {/* Half-Screen Sliding Panel */}
      <div
        className={
          "fixed top-0 left-0 z-[100] h-full w-[50vw] min-w-[280px] max-w-[400px] " +
          "bg-white dark:bg-stone-950 " +
          "shadow-2xl border-r border-stone-200 dark:border-stone-800 " +
          "flex flex-col " +
          "transform transition-transform duration-300 ease-in-out " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* ── "Menu" Header ── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-xl font-black text-stone-900 dark:text-white">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* ── Gap ── */}
        <div className="h-4" />

        {/* ── Sidebar-style Menu Items ── */}
        <nav className="flex-1 overflow-y-auto px-3">
          {/* Notes Menu Item */}
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className={
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all " +
              (notesExpanded
                ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900")
            }
          >
            <div className="flex items-center gap-3">
              <StickyNote className={
                "w-5 h-5 " +
                (notesExpanded ? "text-orange-600 dark:text-orange-400" : "text-stone-400 dark:text-stone-500")
              } />
              <span className="text-sm font-bold">Notes</span>
              {notes.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-[10px] font-bold text-stone-500 dark:text-stone-400">
                  {notes.length}
                </span>
              )}
            </div>
            {notesExpanded
              ? <ChevronDown className="w-4 h-4 text-stone-400" />
              : <ChevronRight className="w-4 h-4 text-stone-400" />
            }
          </button>

          {/* Notes Content — shown when expanded */}
          {notesExpanded && (
            <div className="mt-2 ml-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800/50 space-y-2">
              {notes.length === 0 && (
                <p className="text-xs text-stone-400 dark:text-stone-500 py-4 pl-2">
                  No notes published yet.
                </p>
              )}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                >
                  {note.category && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[9px] font-bold uppercase mb-1.5">
                      {note.category}
                    </span>
                  )}
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white leading-snug">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {typeof note.content === "string"
                      ? note.content
                      : JSON.stringify(note.content)}
                  </p>
                  <p className="text-[9px] text-stone-400 dark:text-stone-600 mt-1.5 font-medium">
                    — {note.authorName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

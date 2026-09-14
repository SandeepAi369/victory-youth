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

      {/* ──── FULL-SCREEN MENU OVERLAY ──── */}
      <div
        className={
          "fixed inset-0 z-[200] bg-white dark:bg-stone-950 " +
          "flex flex-col " +
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* ── Top Bar: "Menu" + X ── */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-black text-stone-900 dark:text-white">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {/* ── Menu Items ── */}
        <nav className="flex-1 overflow-y-auto px-4 pt-6">

          {/* Notes — always visible */}
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className={
              "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors " +
              (notesOpen
                ? "bg-orange-50 dark:bg-orange-950/40"
                : "hover:bg-stone-100 dark:hover:bg-stone-900")
            }
          >
            <div className="flex items-center gap-3">
              <StickyNote className={
                "w-5 h-5 " +
                (notesOpen ? "text-orange-600 dark:text-orange-400" : "text-stone-400 dark:text-stone-500")
              } />
              <span className={
                "text-sm font-semibold " +
                (notesOpen ? "text-orange-700 dark:text-orange-400" : "text-stone-700 dark:text-stone-200")
              }>Notes</span>
            </div>
            {notesOpen
              ? <ChevronDown className="w-4 h-4 text-stone-400" />
              : <ChevronRight className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Notes content — expand on click */}
          <div className={
            "overflow-hidden transition-all duration-300 " +
            (notesOpen ? "max-h-[3000px] opacity-100 mt-2" : "max-h-0 opacity-0")
          }>
            <div className="ml-6 pl-4 border-l-2 border-orange-200 dark:border-orange-800 space-y-2.5 pb-2">
              {safeNotes.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-500 py-6 text-center">
                  No published notes available at the moment.
                </p>
              ) : (
                safeNotes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    {note.category && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[9px] font-bold uppercase mb-2">
                        {note.category}
                      </span>
                    )}
                    <h4 className="font-bold text-[13px] text-stone-900 dark:text-white">{note.title}</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      {typeof note.content === "string" ? note.content : JSON.stringify(note.content)}
                    </p>
                    <p className="text-[9px] text-stone-400 dark:text-stone-600 mt-2 font-medium">— {note.authorName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </nav>
      </div>
    </>
  );
}

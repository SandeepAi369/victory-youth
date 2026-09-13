"use client";

import { useState } from "react";
import { Menu, X, StickyNote, FileText } from "lucide-react";

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

  return (
    <>
      {/* Hamburger Button — shows "Menu" text */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-stone-600 dark:text-stone-300" />
        <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Menu</span>
      </button>

      {/* Dark Backdrop Overlay */}
      <div
        className={
          "fixed inset-0 z-[90] bg-black/60 transition-opacity duration-300 " +
          (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
        onClick={() => setOpen(false)}
      />

      {/* Left-Side Sliding Panel */}
      <div
        className={
          "fixed top-0 left-0 z-[100] h-full w-80 max-w-[85vw] " +
          "bg-white dark:bg-stone-950 " +
          "shadow-2xl border-r border-stone-200 dark:border-stone-800 " +
          "transform transition-transform duration-300 ease-in-out " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Panel Header — matching admin sidebar style */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-stone-900 dark:text-white">Victory Youth</p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500">Important Notes</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Notes Section Header — admin sidebar icon style */}
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800/50">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Notes ({notes.length})
            </span>
          </div>
        </div>

        {/* Notes List */}
        <div className="overflow-y-auto h-[calc(100%-130px)] px-4 py-3 space-y-2.5">
          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <StickyNote className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-3" />
              <p className="text-sm text-stone-400 dark:text-stone-500">No notes published yet.</p>
            </div>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-800/50 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <StickyNote className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {note.category && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[9px] font-bold uppercase mb-1">
                      {note.category}
                    </span>
                  )}
                  <h3 className="font-bold text-xs text-stone-900 dark:text-white leading-snug">
                    {note.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed line-clamp-3">
                    {typeof note.content === "string"
                      ? note.content
                      : JSON.stringify(note.content)}
                  </p>
                  <p className="text-[9px] text-stone-400 dark:text-stone-600 mt-1.5 font-medium">
                    — {note.authorName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

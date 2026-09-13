"use client";

import { useState } from "react";
import { Menu, X, StickyNote } from "lucide-react";

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
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Open Notes"
      >
        <Menu className="w-5 h-5 text-stone-600 dark:text-stone-300" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={
          "fixed top-0 left-0 z-[100] h-full w-80 max-w-[85vw] " +
          "bg-gradient-to-b from-white via-stone-50 to-orange-50 " +
          "dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 " +
          "shadow-2xl border-r border-stone-200/50 dark:border-stone-700/50 " +
          "transform transition-transform duration-300 ease-in-out " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <StickyNote className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Notes
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Notes List */}
        <div className="overflow-y-auto h-[calc(100%-65px)] px-4 py-4 space-y-3">
          {notes.length === 0 && (
            <p className="text-center text-stone-400 dark:text-stone-500 py-10 text-sm">
              No notes published yet.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                {note.category && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase">
                    {note.category}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white leading-snug">
                {note.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                {typeof note.content === "string"
                  ? note.content
                  : JSON.stringify(note.content)}
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2">
                — {note.authorName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

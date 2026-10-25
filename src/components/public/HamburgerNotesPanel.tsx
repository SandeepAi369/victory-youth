"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Menu, X, BookOpen, ChevronRight, Presentation, Phone } from "lucide-react";

export function HamburgerNotesPanel({ notesCount = 0 }: { notesCount: number }) {
  const [open, setOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  // true only in the browser (createPortal needs document.body)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const handleNotesClick = () => {
    setNavigating(true);
    setTimeout(() => {
      setOpen(false);
      router.push("/notes");
    }, 400);
  };

  const handleBannerClick = () => {
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById("banner-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleContactClick = () => {
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById("contact-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const overlay = (
    <div
      className={
        "fixed inset-0 z-[9999] " +
        "transition-opacity duration-300 " +
        (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
      }
    >
      {/* Solid background */}
      <div className="absolute inset-0 bg-white dark:bg-stone-950" />

      {/* Gradient loading bar during navigation */}
      {navigating && (
        <div className="absolute top-0 left-0 right-0 z-50 h-1">
          <div className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse rounded-full" />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-black text-stone-900 dark:text-white">Menu</h2>
          <button
            onClick={() => { setOpen(false); setNavigating(false); }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4 pt-6">
          <button
            onClick={handleNotesClick}
            disabled={navigating}
            className={
              "w-full flex items-center justify-between px-4 py-4 rounded-2xl text-left transition-all duration-200 " +
              (navigating
                ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 scale-[0.98]"
                : "hover:bg-stone-100 dark:hover:bg-stone-900 active:scale-[0.98]")
            }
          >
            <div className="flex items-center gap-4">
              {/* Premium colorful icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-300/30 dark:shadow-orange-900/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[15px] font-bold text-stone-800 dark:text-stone-100 block">
                  Notes
                </span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  {navigating ? "Opening..." : "Committee updates"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notesCount > 0 && (
                <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {notesCount}
                </span>
              )}
              <ChevronRight className={
                "w-4 h-4 text-stone-300 dark:text-stone-600 transition-transform " +
                (navigating ? "translate-x-1" : "")
              } />
            </div>
          </button>

          {/* Banner */}
          <button
            onClick={handleBannerClick}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl text-left transition-all duration-200 hover:bg-stone-100 dark:hover:bg-stone-900 active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-300/30 dark:shadow-blue-900/30">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[15px] font-bold text-stone-800 dark:text-stone-100 block">
                  Banner
                </span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  Featured highlights
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
          </button>

          {/* Contact Us */}
          <button
            onClick={handleContactClick}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl text-left transition-all duration-200 hover:bg-stone-100 dark:hover:bg-stone-900 active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-violet-900 flex items-center justify-center shadow-md shadow-purple-900/40">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[15px] font-bold text-stone-800 dark:text-stone-100 block">
                  Contact Us
                </span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  Get in touch with us
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-stone-600 dark:text-stone-300" />
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Languages, Menu, X, Shield, Heart, Calendar, Music, Image } from "lucide-react";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#120406]/90 backdrop-blur-md border-b border-red-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-yellow-200/50">
            <span className="text-zinc-950 font-black text-xl">ॐ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl gold-gradient-text">
                Victory Youth
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                50th Year
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              Victory Youth Association | Gudem Gally
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <a href="#schedule" className="hover:text-amber-400 transition-colors">
            {t("view_schedule", "Schedule")}
          </a>
          <a href="#aarti" className="hover:text-amber-400 transition-colors">
            {t("live_aarti", "Aarti & Lyrics")}
          </a>
          <a href="#donation" className="hover:text-amber-400 transition-colors">
            {t("donate_now", "Donations")}
          </a>
          <a href="#sponsors" className="hover:text-amber-400 transition-colors">
            {t("sponsors", "Sponsors")}
          </a>
          <a href="#gallery" className="hover:text-amber-400 transition-colors">
            {t("gallery", "Gallery")}
          </a>
        </nav>

        {/* Actions & Language Toggle */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "te" : "en")}
            className="px-3 py-1.5 rounded-xl bg-black/40 border border-red-950 text-zinc-200 text-xs font-bold flex items-center gap-1.5 hover:bg-black/70 transition-all"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            {language === "en" ? "Telugu" : "English"}
          </button>

          {/* Donate Button */}
          <a
            href="#donation"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <Heart className="w-3.5 h-3.5" />
            {t("donate_now", "Donate")}
          </a>

        </div>
      </div>
    </header>
  );
}

export { Header };

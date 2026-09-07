"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { UserRole } from "@/types";
import { Globe, Shield, Sparkles } from "lucide-react";

export function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void } = {}) {
  const { user, currentRole, switchRole } = useAuth();
  const { language, setLanguage } = useLanguage();

  const roles: { role: UserRole; label: string }[] = [
    { role: "SUPER_ADMIN", label: "Super Admin (All)" },
    { role: "PRESIDENT", label: "President (Executive)" },
    { role: "TREASURER", label: "Treasurer (Finance)" },
    { role: "SECRETARY", label: "Secretary (Operations)" },
    { role: "COMMITTEE_MEMBER", label: "Committee Member" },
    { role: "VOLUNTEER", label: "Volunteer" },
    { role: "AUDITOR", label: "Auditor (Read-only)" },
    { role: "MEMBER", label: "General Member" },
  ];

  return (
    <header className="h-16 bg-[#180508] border-b border-amber-500/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>50th Year Swarna Jubilee Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setLanguage(language === "en" ? "te" : "en")}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === "en" ? "తెలుగు" : "English"}</span>
        </button>

        <div className="flex items-center gap-1.5 bg-zinc-900 border border-red-900/60 px-2.5 py-1 rounded-xl text-xs">
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden md:inline text-[11px] text-zinc-400">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
          >
           {roles.map((r) => (
             <option key={r.role} value={r.role} className="bg-zinc-900 text-white">
              {r.label}
            </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pl-2 sm:border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xs shadow">
            {user?.name?.[0] || "A"}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white leading-tight">{user?.name || "Admin User"}</p>
            <p className="text-[10px] text-zinc-400 font-semibold">{currentRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  DollarSign,
  BookOpen,
  Calendar,
  Package,
  UserCheck,
  Trophy,
  Image as ImageIcon,
  FileText,
  FileBadge,
  Bell,
  Settings,
  User,
  Home,
  LogOut,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Members & IDs", href: "/admin/members", icon: Users, permission: () => can("read", "members") },
    { name: "Donations & 80G", href: "/admin/donations", icon: HeartHandshake, permission: () => can("read", "donations") },
    { name: "Finance & Vouchers", href: "/admin/finance", icon: DollarSign, permission: () => can("read", "finance") },
    { name: "Master Summary", href: "/admin/finance/summary", icon: IndianRupee, permission: () => can("read", "finance") },
    { name: "Daily Cash Book", href: "/admin/cashbook", icon: BookOpen, permission: () => can("read", "finance") },
    { name: "Poojas & Events", href: "/admin/events", icon: Calendar, permission: () => can("read", "events") },
    { name: "Inventory & Assets", href: "/admin/inventory", icon: Package, permission: () => can("read", "inventory") },
    { name: "Volunteers & Duties", href: "/admin/volunteers", icon: UserCheck, permission: () => can("read", "volunteers") },
    { name: "Laddu Auction", href: "/admin/auction", icon: Trophy, permission: () => can("read", "auction") },
    { name: "Gallery Manager", href: "/admin/gallery", icon: ImageIcon },
    { name: "Audit Reports", href: "/admin/reports", icon: FileText, permission: () => can("read", "reports") },
    { name: "Permissions & NOC", href: "/admin/documents", icon: FileBadge, permission: () => can("read", "documents") },
    { name: "Announcements", href: "/admin/notices", icon: Bell, permission: () => can("read", "notices") },
    { name: "System Settings", href: "/admin/settings", icon: Settings, permission: () => can("read", "settings") },
    { name: "My Profile", href: "/admin/profile", icon: User },
  ];

  const allowedNav = navigation.filter((item) => !item.permission || item.permission());

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#120406] border-r border-amber-500/30 shrink-0 sticky top-0">
      <div className="p-5 border-b border-red-950/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shrink-0">
          🕉
        </div>
        <div className="overflow-hidden">
          <h2 className="text-sm font-black gold-gradient-text truncate">Victory Youth</h2>
          <p className="text-[11px] text-zinc-400 font-semibold truncate">VYA Committee ERP</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
          Core Management
        </div>
        {allowedNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
             key={item.name}
             href={item.href}
             className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition group",
              isActive
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md font-bold"
               : "text-zinc-300 hover:bg-red-950/50 hover:text-white"
            )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-zinc-950" : "text-amber-400 group-hover:text-amber-300")} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-red-950/80 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-950/60 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold transition"
        >
          <Home className="w-3.5 h-3.5" /> Public Portal
        </Link>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900 text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

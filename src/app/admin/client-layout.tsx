"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import {
  LayoutDashboard, IndianRupee, HandCoins, BarChart3,
  Users, Calendar, Image, Bell, StickyNote, Package, Settings, LogOut, Menu, X,
  Presentation, Clapperboard, UserCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { logoutAction } from "@/app/login/actions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/chanda", label: "Chanda", icon: IndianRupee },
  { href: "/admin/donations", label: "Donations", icon: HandCoins },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/summary", label: "Summary", icon: BarChart3 },
  { href: "/admin/active-members", label: "Active Members", icon: UserCheck },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/banners", label: "Banners", icon: Presentation },
  { href: "/admin/story", label: "Story", icon: Clapperboard },
  { href: "/admin/notices", label: "Notices", icon: Bell },
  { href: "/admin/notes", label: "Notes", icon: StickyNote },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/** Header title: the menu label of the current section (never a raw id from the URL). */
function pageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (/^\/admin\/contributors\/[^/]+/.test(pathname)) return "Contributor Profile";
  if (/^\/admin\/members\/[^/]+/.test(pathname)) return "Member";
  const item = navItems.filter((n) => n.href !== "/admin" && pathname.startsWith(n.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return item?.label ?? "Admin Panel";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Listen for loading events fired by child pages
  useEffect(() => {
    const onStart = () => {
      setLoading(true);
      setProgress(20);
      // Smoothly animate to 80% while waiting
      const t1 = setTimeout(() => setProgress(50), 200);
      const t2 = setTimeout(() => setProgress(75), 700);
      const t3 = setTimeout(() => setProgress(85), 1400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    };
    const onEnd = () => {
      setProgress(100);
      const t = setTimeout(() => { setLoading(false); setProgress(0); }, 400);
      return () => clearTimeout(t);
    };
    window.addEventListener("admin-loading-start", onStart);
    window.addEventListener("admin-loading-end", onEnd);
    return () => {
      window.removeEventListener("admin-loading-start", onStart);
      window.removeEventListener("admin-loading-end", onEnd);
    };
  }, []);

  const handleLogout = () => {
    // Session cookie is httpOnly, so it can only be cleared on the server
    void logoutAction();
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* ── YouTube-style top loading bar ── */}
      {loading && (
        <div
          className="fixed top-0 left-0 z-[9999] h-[3px] bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(249,115,22,0.7)]"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-card border-b border-border">
        <span className="font-bold text-lg">Victory Youth Admin</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "block" : "hidden"} md:block w-full md:w-60 bg-card border-r border-border flex-shrink-0`}>
        <div className="hidden md:flex h-16 items-center px-5 border-b border-border">
          <span className="font-bold text-lg text-foreground">Victory Youth Admin</span>
        </div>
        <div className="py-3 px-3 space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 font-medium text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
          <h1 className="font-semibold text-lg text-foreground capitalize">
            {pageTitle(pathname)}
          </h1>
          <ModeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

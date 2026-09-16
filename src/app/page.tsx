import Link from "next/link";
import { getHomepageData } from "@/lib/queries/public";
import { CountdownTimer } from "@/components/public/CountdownTimer";
import { Footer } from "@/components/public/Footer";
import { ModeToggle } from "@/components/mode-toggle";
import { HamburgerNotesPanel } from "@/components/public/HamburgerNotesPanel";
import { BannerCarousel } from "@/components/public/BannerCarousel";
import { Sparkles, Calendar, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, stats, hero, events, publishedDonations, notes, banners } = await getHomepageData();

  const progressPercentage = stats.donationTarget > 0
    ? Math.min(Math.round((stats.totalAmount / stats.donationTarget) * 100), 100)
    : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // Quick actions — ALL dedicated routes, NO anchors
  const quickActions = [
    { emoji: "📅", title: "Events", desc: "11 Days of Celebrations", href: "/events", gradient: "from-blue-500 to-indigo-600" },
    { emoji: "💰", title: "Donations", desc: "Our Generous Donors", href: "/donations", gradient: "from-amber-500 to-orange-600" },
    { emoji: "🪙", title: "Chanda", desc: "Member Contributions", href: "/chanda", gradient: "from-yellow-500 to-amber-600" },
    { emoji: "👥", title: "Committee", desc: "Youth Members", href: "/members", gradient: "from-indigo-500 to-blue-600" },
    { emoji: "📢", title: "Notices", desc: "Updates & Announcements", href: "/notices", gradient: "from-teal-500 to-cyan-600" },
    { emoji: "🖼️", title: "Gallery", desc: "Festival Memories", href: "/gallery", gradient: "from-purple-500 to-violet-600" },
  ];

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* ===== STICKY NAV ===== */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-default select-none">
            <HamburgerNotesPanel notesCount={(notes as any[])?.length || 0} />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Victory Youth
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* ===== HERO BANNER ===== */}
      <section className="pt-16">
        <div className="w-full bg-stone-950">
          <img
            src="/hero-banner.jpg"
            alt="Banswada Ka Raja — Victory Youth Association, Gudem Gally — 50+ Years of Devotion & Service"
            width={1024}
            height={576}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* ===== QUICK ACTIONS — Dedicated Routes, NO anchors ===== */}
      <section className="py-10 px-4 -mt-8 relative z-20">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-2xl shadow-lg mb-3`}>
                  {action.emoji}
                </div>
                <h3 className="font-bold text-stone-900 dark:text-white text-sm">{action.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BANNER CAROUSEL ===== */}
      {banners && banners.length > 0 && (
        <section id="banner-section" className="py-8 px-4 -mt-2">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
              🎯 Banner
            </h2>
            <BannerCarousel banners={banners} />
          </div>
        </section>
      )}

      {/* ===== DONATION PROGRESS ===== */}
      {stats.donationTarget > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" /> Donation Progress
                </h3>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{progressPercentage}%</span>
              </div>
              <div className="h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-500 dark:text-stone-400">
                <span>Raised: {formatCurrency(stats.totalAmount)}</span>
                <span>Target: {formatCurrency(stats.donationTarget)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED EVENTS (Top 3 only, with "View All" link) ===== */}
      {events && events.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white">📅 Festival Schedule</h2>
              <Link href="/events" className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {events.slice(0, 3).map((evt: any) => (
                <div key={evt.id} className="group bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-700 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="relative aspect-video bg-stone-100 dark:bg-stone-700 overflow-hidden">
                    {evt.imageUrl ? (
                      <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-stone-300 dark:text-stone-600" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">Day {evt.day}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2">{evt.title}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2 flex-1">{evt.description}</p>
                    <div className="space-y-1 pt-3 border-t border-stone-100 dark:border-stone-700 text-sm text-stone-700 dark:text-stone-300">
                      {evt.timing && <div>🕒 {evt.date} · {evt.timing}</div>}
                      {evt.location && <div>📍 {evt.location}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== RECENT DONATIONS (Top 6 preview with "View All") ===== */}
      {publishedDonations && publishedDonations.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white">🙏 Recent Donors</h2>
              <Link href="/donations" className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {publishedDonations.slice(0, 6).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-800 border border-orange-100 dark:border-stone-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                      {d.donorName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{d.donorName}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{d.category || "General"} · {d.date}</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{Math.round(Number(d.amount) || 0).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <Footer
        associationName="Victory Youth Association"
        address={settings?.address ?? undefined}
        email={settings?.contactEmail ?? undefined}
        phone={settings?.contactPhone ?? undefined}
      />
    </main>
  );
}

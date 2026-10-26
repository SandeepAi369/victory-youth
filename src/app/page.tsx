import Link from "next/link";
import { PersonRow } from "@/components/public/PersonRow";
import { YearScope, yearScopeNote } from "@/components/public/ContributionTotals";
import { getHomepageData } from "@/lib/queries/public";
import { Footer } from "@/components/public/Footer";
import { ModeToggle } from "@/components/mode-toggle";
import { CalculatorLauncher } from "@/components/public/Calculator";
import { HamburgerNotesPanel } from "@/components/public/HamburgerNotesPanel";
import { BannerCarousel } from "@/components/public/BannerCarousel";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { Sparkles, Calendar, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, years, stats, hero, events, publishedDonations, notes, banners, heroImages } = await getHomepageData();

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
            <HamburgerNotesPanel notesCount={notes.length} />
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

      {/* ===== GOLDEN ASSOCIATION BANNER ===== */}
      <style>{`
        @keyframes goldPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes goldFloat {
          0%, 100% { opacity: 0.15; transform: translateY(0px) scale(0.7); }
          50% { opacity: 0.8; transform: translateY(-4px) scale(1); }
        }
        @keyframes goldShimmer {
          0%, 100% { opacity: 0.1; transform: rotate(0deg) scale(0.5); }
          50% { opacity: 0.7; transform: rotate(180deg) scale(1); }
        }
        @keyframes spinCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinCCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .gp1 { animation: goldPulse 2s ease-in-out infinite; }
        .gp2 { animation: goldFloat 2.5s ease-in-out infinite 0.4s; }
        .gp3 { animation: goldShimmer 3s ease-in-out infinite 0.8s; }
        .gp4 { animation: goldPulse 2.2s ease-in-out infinite 1.2s; }
        .gp5 { animation: goldFloat 2.8s ease-in-out infinite 0.6s; }
        .gp6 { animation: goldShimmer 3.2s ease-in-out infinite 1.5s; }
        .spin-cw  { animation: spinCW  8s linear infinite; }
        .spin-ccw { animation: spinCCW 12s linear infinite; }
      `}</style>
      <div className="w-full flex justify-center items-center py-2 gap-3 mt-16 overflow-hidden" style={{background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"}}>

        {/* Left sparkles + Om */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Animated sparkle cluster */}
          <div className="relative w-10 h-10 hidden sm:block">
            <span className="gp1 absolute" style={{top:"2px",left:"2px",fontSize:"7px",color:"#FFD700"}}>✦</span>
            <span className="gp2 absolute" style={{top:"8px",left:"14px",fontSize:"10px",color:"#FFC200"}}>★</span>
            <span className="gp3 absolute" style={{top:"20px",left:"3px",fontSize:"6px",color:"#FFD700"}}>◆</span>
            <span className="gp4 absolute" style={{top:"28px",left:"16px",fontSize:"8px",color:"#FFC200"}}>✦</span>
            <span className="gp5 absolute" style={{top:"14px",left:"24px",fontSize:"5px",color:"#FFD700"}}>★</span>
            <span className="gp6 absolute" style={{top:"4px",left:"22px",fontSize:"6px",color:"#C8960C"}}>◆</span>
          </div>
          {/* Om with rotating rings behind */}
          <div className="flex-shrink-0 flex flex-col items-center select-none" style={{lineHeight:1}}>
            <div className="relative flex items-center justify-center" style={{width:"clamp(52px,10vw,68px)",height:"clamp(52px,10vw,68px)"}}>
              {/* Outer ring — slow CW */}
              <svg className="spin-cw absolute inset-0 w-full h-full" viewBox="0 0 68 68" fill="none">
                <circle cx="34" cy="34" r="31" stroke="#FFD700" strokeWidth="1" strokeDasharray="6 5" opacity="0.5"/>
                <circle cx="34" cy="5" r="2.5" fill="#FFD700" opacity="0.8"/>
                <circle cx="63" cy="34" r="2" fill="#FFD700" opacity="0.6"/>
                <circle cx="5" cy="34" r="2" fill="#FFD700" opacity="0.6"/>
              </svg>
              {/* Inner ring — faster CCW */}
              <svg className="spin-ccw absolute inset-0 w-full h-full" viewBox="0 0 68 68" fill="none">
                <circle cx="34" cy="34" r="22" stroke="#C8960C" strokeWidth="1" strokeDasharray="4 8" opacity="0.6"/>
                <polygon points="34,14 36,18 32,18" fill="#FFD700" opacity="0.7"/>
                <polygon points="54,34 50,32 50,36" fill="#FFD700" opacity="0.7"/>
                <polygon points="14,34 18,36 18,32" fill="#FFD700" opacity="0.7"/>
                <polygon points="34,54 32,50 36,50" fill="#FFD700" opacity="0.7"/>
              </svg>
              {/* Om symbol on top */}
              <span style={{fontSize:"clamp(2.2rem,6.5vw,3.2rem)",color:"#FFD700",textShadow:"0 0 16px rgba(255,215,0,0.9),0 0 32px rgba(255,215,0,0.5)",fontFamily:"serif",zIndex:1,position:"relative"}}>ॐ</span>
            </div>
            <div style={{width:"clamp(36px,8vw,52px)",height:"1.5px",background:"linear-gradient(90deg,transparent,#FFD700,transparent)",marginTop:"3px"}} />
          </div>
        </div>

        {/* Center glass pill — unchanged */}
        <div className="flex-shrink-0 inline-flex flex-col items-center px-6 py-1.5 rounded-2xl border border-yellow-400/30" style={{background:"rgba(212,160,23,0.12)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",boxShadow:"0 4px 24px rgba(212,160,23,0.15),inset 0 1px 0 rgba(255,215,0,0.2)"}}>
          <span className="font-black text-sm tracking-[0.18em] uppercase" style={{color:"#FFD700"}}>GANESH</span>
          <span className="font-black text-sm tracking-[0.18em] uppercase" style={{color:"#FFD700"}}>ASSOCIATION</span>
        </div>

        {/* Right Om + sparkles */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Om with rotating rings behind */}
          <div className="flex-shrink-0 flex flex-col items-center select-none" style={{lineHeight:1}}>
            <div className="relative flex items-center justify-center" style={{width:"clamp(52px,10vw,68px)",height:"clamp(52px,10vw,68px)"}}>
              {/* Outer ring — slow CW */}
              <svg className="spin-cw absolute inset-0 w-full h-full" viewBox="0 0 68 68" fill="none">
                <circle cx="34" cy="34" r="31" stroke="#FFD700" strokeWidth="1" strokeDasharray="6 5" opacity="0.5"/>
                <circle cx="34" cy="5" r="2.5" fill="#FFD700" opacity="0.8"/>
                <circle cx="63" cy="34" r="2" fill="#FFD700" opacity="0.6"/>
                <circle cx="5" cy="34" r="2" fill="#FFD700" opacity="0.6"/>
              </svg>
              {/* Inner ring — faster CCW */}
              <svg className="spin-ccw absolute inset-0 w-full h-full" viewBox="0 0 68 68" fill="none">
                <circle cx="34" cy="34" r="22" stroke="#C8960C" strokeWidth="1" strokeDasharray="4 8" opacity="0.6"/>
                <polygon points="34,14 36,18 32,18" fill="#FFD700" opacity="0.7"/>
                <polygon points="54,34 50,32 50,36" fill="#FFD700" opacity="0.7"/>
                <polygon points="14,34 18,36 18,32" fill="#FFD700" opacity="0.7"/>
                <polygon points="34,54 32,50 36,50" fill="#FFD700" opacity="0.7"/>
              </svg>
              {/* Om symbol on top */}
              <span style={{fontSize:"clamp(2.2rem,6.5vw,3.2rem)",color:"#FFD700",textShadow:"0 0 16px rgba(255,215,0,0.9),0 0 32px rgba(255,215,0,0.5)",fontFamily:"serif",zIndex:1,position:"relative"}}>ॐ</span>
            </div>
            <div style={{width:"clamp(36px,8vw,52px)",height:"1.5px",background:"linear-gradient(90deg,transparent,#FFD700,transparent)",marginTop:"3px"}} />
          </div>
          {/* Animated sparkle cluster */}
          <div className="relative w-10 h-10 hidden sm:block">
            <span className="gp2 absolute" style={{top:"2px",left:"8px",fontSize:"7px",color:"#FFD700"}}>✦</span>
            <span className="gp3 absolute" style={{top:"8px",left:"0px",fontSize:"10px",color:"#FFC200"}}>★</span>
            <span className="gp4 absolute" style={{top:"20px",left:"14px",fontSize:"6px",color:"#FFD700"}}>◆</span>
            <span className="gp1 absolute" style={{top:"28px",left:"2px",fontSize:"8px",color:"#FFC200"}}>✦</span>
            <span className="gp6 absolute" style={{top:"14px",left:"20px",fontSize:"5px",color:"#FFD700"}}>★</span>
            <span className="gp5 absolute" style={{top:"4px",left:"22px",fontSize:"6px",color:"#C8960C"}}>◆</span>
          </div>
        </div>

      </div>
      {/* ===== HERO BANNER (Dynamic Carousel) ===== */}
      <HeroCarousel
        images={heroImages}
        fallbackUrl={hero.imageUrl}
        fallbackAlt={hero.imageAlt || "Victory Youth Association"}
      />

      {/* ===== TEST_DESIGN_START ===== */}
      <section className="py-0 overflow-hidden bg-stone-100 dark:bg-stone-950 border-y border-stone-200 dark:border-stone-800">

        {/* ── Top 5 Golden Icons ── */}
        <div className="py-6 px-4 border-b border-orange-200 dark:border-yellow-600/20">
          <div className="container mx-auto max-w-full px-2 sm:px-6">
            <div className="flex justify-between items-center">
              {[
                {icon: "📅", name: "Events", href: "/events"},
                {icon: "💰", name: "Donations", href: "/donations"},
                {icon: "🪙", name: "Chanda", href: "/chanda"},
                {icon: "👥", name: "Committee", href: "/members"},
                {icon: "🖼️", name: "Gallery", href: "/gallery"}
              ].map((item) => (
                <Link key={item.name} href={item.href} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-xl sm:text-2xl mb-1.5 group-hover:scale-110 transition-transform border-orange-400 dark:border-yellow-600 bg-orange-50 dark:bg-yellow-900/20">
                    {item.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-orange-700 dark:text-yellow-400">{item.name}</span>
                </Link>
              ))}
            </div>
            {/* Calculator and Active Members, right below the five icons */}
            <div className="flex justify-center gap-10 sm:gap-16 mt-4">
              <CalculatorLauncher />
              <Link href="/active-members" className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-xl sm:text-2xl mb-1.5 group-hover:scale-110 transition-transform border-orange-400 dark:border-yellow-600 bg-orange-50 dark:bg-yellow-900/20">
                  <span aria-hidden>🙋</span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-orange-700 dark:text-yellow-400">Active Members</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Decorative golden divider ── */}
        <div className="flex items-center justify-center gap-2 py-3">
          <div style={{width:"60px",height:"1px",background:"linear-gradient(90deg,transparent,#C8960C)"}} />
          <span style={{color:"#FFD700",fontSize:"16px"}}>❀</span>
          <div style={{width:"60px",height:"1px",background:"linear-gradient(90deg,#C8960C,transparent)"}} />
        </div>

        {/* ── Three Feature Cards ── */}
        <div className="px-4 pb-6">
          <div className="container mx-auto max-w-3xl">
            <div className="grid grid-cols-3 gap-4">

              {/* Upcoming Events */}
              <div className="relative rounded-xl overflow-hidden" style={{background:"linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f97316 100%)", minHeight:"140px"}}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full flex justify-center gap-1 pt-1">
                    <span style={{fontSize:"8px"}}>🔺</span>
                    <span style={{fontSize:"8px"}}>🔺</span>
                    <span style={{fontSize:"8px"}}>🔺</span>
                    <span style={{fontSize:"8px"}}>🔺</span>
                    <span style={{fontSize:"8px"}}>🔺</span>
                  </div>
                </div>
                <div className="relative p-3 flex flex-col justify-between h-full">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2" style={{background:"rgba(255,255,255,0.2)"}}>
                    📅
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xs leading-tight">Upcoming Events</h3>
                    <p className="text-[9px] text-white/80 mt-1 leading-tight">Stay updated with our latest events and celebrations.</p>
                  </div>
                </div>
              </div>

              {/* Donation Drive */}
              <div className="relative rounded-xl overflow-hidden" style={{background:"linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)", minHeight:"140px"}}>
                <div className="relative p-3 flex flex-col justify-between h-full">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2" style={{background:"rgba(255,255,255,0.2)"}}>
                    💝
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xs leading-tight">Donation Drive</h3>
                    <p className="text-[9px] text-white/80 mt-1 leading-tight">Your support helps us spread more happiness.</p>
                  </div>
                </div>
              </div>

              {/* Become a Member */}
              <div className="relative rounded-xl overflow-hidden" style={{background:"linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)", minHeight:"140px"}}>
                <div className="relative p-3 flex flex-col justify-between h-full">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2" style={{background:"rgba(255,255,255,0.2)"}}>
                    👥
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xs leading-tight">Become a Member</h3>
                    <p className="text-[9px] text-white/80 mt-1 leading-tight">Join our youth community and be a part of something big.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Bottom golden divider + tagline ── */}
        <div className="flex flex-col items-center pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div style={{width:"40px",height:"1px",background:"linear-gradient(90deg,transparent,#C8960C)"}} />
            <span style={{color:"#C8960C",fontSize:"12px"}}>❀</span>
            <div style={{width:"40px",height:"1px",background:"linear-gradient(90deg,#C8960C,transparent)"}} />
          </div>
          <p className="text-xs font-bold italic tracking-wide" style={{color:"#C8960C"}}>|| Ganpati Bappa Morya ||</p>
        </div>

      </section>
      {/* ===== TEST_DESIGN_END ===== */}

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

      {/* ===== DONATION PROGRESS ===== */}
      {stats.donationTarget > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" /> Donation Progress
                </h3>
                <div className="flex items-center gap-2">
                  <YearScope years={years} tone="card" />
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{progressPercentage}%</span>
                </div>
              </div>
              <div className="h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-500 dark:text-stone-400">
                <span>Raised: {formatCurrency(stats.totalAmount)}</span>
                <span>Target: {formatCurrency(stats.donationTarget)}</span>
              </div>
              {stats.chandaAmount > 0 && (
                <p className="mt-3 text-xs text-stone-600 dark:text-stone-300">
                  Chanda is counted separately: <Link href="/chanda" className="font-bold text-orange-600 dark:text-orange-400 hover:underline">{formatCurrency(stats.chandaAmount)} collected →</Link>
                </p>
              )}
              <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400">{yearScopeNote(years)} Donations only — Chanda is not included.</p>
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
              {events.slice(0, 3).map((evt) => (
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
              {/* One row per person (latest first); itemized history is on their profile */}
              {publishedDonations.map((p) => <PersonRow key={p.key} person={p} noun="donation" tone="orange" />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== SOCIAL / CONTACT ICONS ===== */}
      <section id="contact-section" className="py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border border-purple-300/70 dark:border-purple-600/50 shadow-md shadow-purple-100/60 dark:shadow-purple-900/30">
              <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
              <h2 className="text-base font-black tracking-widest uppercase text-purple-800 dark:text-purple-200">Contact Us</h2>
              <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-6">
            {/* GitHub */}
            <a href="https://github.com/SandeepAi369" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full bg-[#24292f] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </div>
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">GitHub</span>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/victory_youth_bswd" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"}}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Instagram</span>
            </a>
            {/* Google Maps */}
            <a href="https://maps.app.goo.gl/8SgCjUJhztJs32f4A" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border border-stone-200 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" viewBox="0 0 92.3 132.3"><path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/><path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3L10.8 16.5z"/><path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"/><path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"/><path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"/></svg>
              </div>
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Maps</span>
            </a>
            {/* Gmail */}
            <a href="mailto:victoryyouthbswd@gmail.com" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border border-stone-200 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-6" viewBox="0 0 75 50"><path fill="#ea4335" d="M0 8L37.5 30 75 8V4C75 1.8 73.2 0 71 0H4C1.8 0 0 1.8 0 4v4z"/><path fill="#fbbc04" d="M0 8l37.5 22L0 46V8z" opacity=".8"/><path fill="#34a853" d="M75 8L37.5 30 75 46V8z" opacity=".8"/><path fill="#c5221f" d="M75 46V8L37.5 30 75 46z" opacity=".6"/><path fill="#4285f4" d="M0 46l37.5-16L0 8v38z" opacity=".6"/><path fill="#1a73e8" d="M0 46c0 2.2 1.8 4 4 4h67c2.2 0 4-1.8 4-4V8L37.5 30 0 8v38z" opacity=".2"/></svg>
              </div>
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Mail</span>
            </a>
          </div>
        </div>
      </section>

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

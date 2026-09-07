"use client";

import React, { createContext, useContext, useState } from "react";

type Language = "en" | "te";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    hero_tag: "50th Golden Jubilee (1974 - 2026)",
    hero_title: "Victory Youth",
    hero_subtitle: "Victory Youth Association - Gudem Gally",
    hero_desc: "Celebrating 50 years of devotion, unity, and service. Join us for the grand 11-day Ganesh Mahaotsavam.",
    donate_now: "Donate Now",
    view_schedule: "View Schedule",
    live_aarti: "Live Aarti & Lyrics",
    gallery: "50-Year Archive",
    sponsors: "Sponsors Wall",
    admin_login: "Admin Portal",
    donation_tag: "SACRED CONTRIBUTION",
    donation_title: "Offer Your Seva & Donations",
    donation_subtitle: "Support the 50th Golden Jubilee Mahaotsavam. All donations are 80G tax-exempt with instant digital receipts.",
    dashboard: "Executive Dashboard",
    members: "Member Management",
    finance: "Finance & Cash Book",
    donations: "Donation Ledger",
    events: "Festival Schedule",
    inventory: "Inventory & Assets",
    volunteers: "Volunteer Duties",
    auction: "Maha Laddu Auction",
    reports: "Audit & Reports",
    notices: "Notices & Circulars",
    settings: "Association Settings",
    total_members: "Total Members",
    total_donations: "Total Donations",
    total_expenses: "Total Expenses",
    bank_balance: "SBI Bank Balance",
    quick_actions: "Quick Actions",
    new_donation: "New 80G Donation",
    add_expense: "Add Expense Voucher",
    register_member: "Register Member",
    scan_qr: "Scan QR Attendance",
  },
  te: {
    hero_tag: "50 sanvatsarala Swarnotsavam (1974 - 2026)",
    hero_title: "Victory Youth",
    hero_subtitle: "Victory Youth Association - Gudem Gally",
    hero_desc: "50 sanvatsarala bhakti, aikyata, seva. 11 rojula Maha Ganesh Utsavalalo palgonandi.",
    donate_now: "Viralam Ivvandi",
    view_schedule: "Karyakramalu",
    live_aarti: "Harathi & Patalu",
    gallery: "50 Sanvatsarala Chitralu",
    sponsors: "Datala Pattika",
    admin_login: "Admin Portal",
    donation_tag: "SEVA VIRALAM",
    donation_title: "Mee Seva Viralam Samarpinchandi",
    donation_subtitle: "50va Swarnotsava Maha Utsavam kosam sahakarinchandi. Anni viralalaku 80G tax rasseedu labhisthundi.",
    dashboard: "Pradhana Dashboard",
    members: "Sabhyula Vivaralu",
    finance: "Kharculu & Cash Book",
    donations: "Datala Viralamula Chittha",
    events: "Utsava Karyakramalu",
    inventory: "Samagri Nirvahana",
    volunteers: "Karyakarthala Sevalu",
    auction: "Maha Laddu Lelam",
    reports: "Lekhalu & Reports",
    notices: "Prakatanalu & Circularlu",
    settings: "Sangham Settings",
    total_members: "Mothaniki Sabhyulu",
    total_donations: "Mothaniki Viralamulu",
    total_expenses: "Mothaniki Kharculu",
    bank_balance: "SBI Bank Nilva",
    quick_actions: "Twarita Karyamulu",
    new_donation: "Kotta 80G Viralam",
    add_expense: "Kharcu Voucher",
    register_member: "Kotta Sabhyuni Cherchandi",
    scan_qr: "QR Attendance Scan",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (k, d) => d || k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string, defaultText?: string): string => {
    return (TRANSLATIONS as any)[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

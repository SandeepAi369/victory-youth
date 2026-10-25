"use client";

import React, { useState, useTransition } from "react";
import { AssociationSettings, Member } from "@/types";
import { generateMemberIdCardPdf } from "@/lib/pdf-generator";
import { getQrCodeImageUrl } from "@/lib/qr-util";
import { findMemberCard } from "./actions";
import Link from "next/link";
import { Search, Download, ArrowLeft } from "lucide-react";

export default function MemberIdPage() {
  const [query, setQuery] = useState("");
  const [foundMember, setFoundMember] = useState<Member | null>(null);
  const [settings, setSettings] = useState<AssociationSettings | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, startSearch] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    startSearch(async () => {
      const result = await findMemberCard(query);
      setFoundMember(result?.member ?? null);
      setSettings(result?.settings ?? null);
      setSearched(true);
    });
  };

  return (
    <div className="min-h-screen bg-[#120406] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-400 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Portal
        </Link>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            🆔
          </div>
          <h1 className="text-2xl sm:text-3xl font-black gold-gradient-text">
            Digital Member ID Verifier
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Search your registered PVC ID card by Mobile Number or Member ID
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Mobile (e.g. 98480 12345) or ID"
            className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-red-900 text-white text-sm focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> {isSearching ? "Checking..." : "Verify"}
          </button>
        </form>

        {searched && (
          foundMember && settings ? (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#3c0a0f] via-[#200508] to-[#0a0204] border-2 border-amber-500 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🕉</span>
                    <div>
                      <h3 className="text-sm font-black gold-gradient-text">{settings.shortName}</h3>
                      <p className="text-[10px] text-zinc-400">Gudem Gally, Banswada</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950">
                    VERIFIED MEMBER
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-300 font-black text-2xl">
                    {foundMember.name[0]}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{foundMember.name}</h3>
                    <p className="text-xs text-amber-300 font-semibold">{foundMember.role}</p>
                    <p className="text-[11px] text-zinc-400">ID: {foundMember.memberId} | Phone: {foundMember.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="text-[11px] text-zinc-400">
                    <p>Gotram: {foundMember.gotram || "-"}</p>
                  </div>
                  <div className="w-16 h-16 p-1 bg-white rounded-xl">
                    <img
                      src={getQrCodeImageUrl(`VYA-MEMBER:${foundMember.memberId}`, 150)}
                      alt="QR"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => generateMemberIdCardPdf(foundMember, settings)}
                className="w-full py-3.5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" /> Download Official PVC ID Card (PDF)
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-black/40 border border-red-950 text-center space-y-2">
              <p className="text-sm text-red-400 font-semibold">No member record found for &quot;{query}&quot;</p>
              <p className="text-xs text-zinc-400">Please contact Victory Youth Association committee to enroll.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

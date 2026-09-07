"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ganeshStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { generateDonationReceiptPdf } from "@/lib/pdf-generator";
import Link from "next/link";
import { Download, ArrowLeft, ShieldCheck } from "lucide-react";

export default function PublicReceiptPage() {
  const params = useParams();
  const id = params?.id as string;

  const donations = ganeshStore.getDonations();
  const donation = donations.find((d) => d.id === id || d.receiptNo.replace("#", "") === id);
  const settings = ganeshStore.getSettings();

  if (!donation) {
    return (
      <div className="min-h-screen bg-[#120406] text-white py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Receipt Not Found</h2>
        <p className="text-zinc-400 text-sm mb-6">The requested donation receipt could not be verified.</p>
        <Link href="/" className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120406] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-400 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Portal
        </Link>

        <div className="p-6 rounded-3xl bg-black/60 border border-red-900 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-black gold-gradient-text">{settings.shortName}</h2>
              <p className="text-[11px] text-zinc-400">Official 80G Donation Receipt</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Valid Transaction
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Receipt Number:</span>
              <span className="font-bold text-amber-300">{donation.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Devotee Name:</span>
              <span className="font-bold text-white">{donation.donorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Amount Paid:</span>
              <span className="text-lg font-black text-emerald-400">
                {formatCurrency(donation.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Seva Purpose:</span>
              <span className="font-semibold text-zinc-200">{donation.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Date & Time:</span>
              <span className="font-mono text-zinc-300">{donation.date}</span>
            </div>
          </div>

          <button
            onClick={() => generateDonationReceiptPdf(donation, settings)}
            className="w-full py-3.5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Download className="w-4 h-4" /> Download 80G Receipt PDF
          </button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAssociationSettings, getReceiptDonation } from "@/lib/queries/public";
import { toAssociationSettings } from "@/lib/settings-view";
import type { Donation } from "@/types";
import ReceiptDownloadButton from "./download-button";

export const dynamic = "force-dynamic";

export default async function PublicReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, settingsRow] = await Promise.all([getReceiptDonation(decodeURIComponent(id)), getAssociationSettings()]);
  const settings = toAssociationSettings(settingsRow);

  if (!row) {
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

  const donation: Donation = {
    id: row.id,
    receiptNo: row.receiptNo,
    date: row.date || row.createdAt?.toISOString().slice(0, 10) || "",
    donorName: row.isAnonymous ? "Anonymous Devotee" : row.donorName,
    phone: row.isAnonymous ? undefined : row.phone,
    donorPhone: row.isAnonymous ? undefined : row.donorPhone ?? undefined,
    amount: row.amount,
    paymentMode: row.paymentMode || "",
    status: row.status ?? undefined,
    purpose: row.purpose || "",
    gotram: row.gotram ?? undefined,
    transactionId: row.transactionId ?? undefined,
    taxExempt80G: row.taxExempt80G ?? undefined,
  };

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

          <ReceiptDownloadButton donation={donation} settings={settings} />
        </div>
      </div>
    </div>
  );
}

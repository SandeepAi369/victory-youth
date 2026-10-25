"use client";

import { Download } from "lucide-react";
import { generateDonationReceiptPdf } from "@/lib/pdf-generator";
import type { AssociationSettings, Donation } from "@/types";

export default function ReceiptDownloadButton({
  donation,
  settings,
}: {
  donation: Donation;
  settings: AssociationSettings;
}) {
  return (
    <button
      onClick={() => generateDonationReceiptPdf(donation, settings)}
      className="w-full py-3.5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
    >
      <Download className="w-4 h-4" /> Download 80G Receipt PDF
    </button>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { updateAssociationSettings } from "@/lib/actions/admin";
import { Save } from "lucide-react";

export type SettingsFormValues = {
  associationName: string;
  shortName: string;
  registrationNo: string;
  tax80GNo: string;
  upiVpa: string;
  upiName: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  contactPhone: string;
  contactEmail: string;
};

type Field = { key: keyof SettingsFormValues; label: string };

const BRANDING_FIELDS: Field[] = [
  { key: "associationName", label: "Association Name" },
  { key: "shortName", label: "Short Name / Title" },
  { key: "registrationNo", label: "Society Registration #" },
  { key: "tax80GNo", label: "80G Tax Exemption #" },
  { key: "contactPhone", label: "Contact Phone" },
  { key: "contactEmail", label: "Contact Email" },
];

const PAYMENT_FIELDS: Field[] = [
  { key: "upiVpa", label: "UPI VPA (Virtual Payment Address)" },
  { key: "upiName", label: "Merchant / Payee Name" },
  { key: "bankName", label: "Bank Name" },
  { key: "bankAccountNo", label: "A/C Number" },
  { key: "bankIfsc", label: "IFSC Code" },
  { key: "bankBranch", label: "Bank Branch" },
];

export default function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [settings, setSettings] = useState<SettingsFormValues>(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      // Empty inputs are saved as NULL so no stale or placeholder value lingers
      const data = Object.fromEntries(
        Object.entries(settings).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()])
      );
      if (!data.associationName) delete data.associationName;
      if (!data.shortName) delete data.shortName;

      const result = await updateAssociationSettings(data);
      setMessage(
        result.success
          ? { ok: true, text: "✅ Settings saved successfully!" }
          : { ok: false, text: `❌ Could not save settings: ${"error" in result ? result.error : "unknown error"}` }
      );
    });
  };

  const renderFields = (fields: Field[]) =>
    fields.map(({ key, label }) => (
      <div key={key}>
        <label className="block text-xs text-zinc-400 mb-1">{label}</label>
        <input
          type="text"
          value={settings[key]}
          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
        />
      </div>
    ));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black gold-gradient-text">
            System Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Association Info, UPI Config, and Bank Details
          </p>
        </div>
      </div>

      {message && (
        <div
          className={
            message.ok
              ? "p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold"
              : "p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-300 text-xs font-bold"
          }
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-black/40 border border-red-950 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-zinc-800">
            Association Branding & Legal Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderFields(BRANDING_FIELDS)}</div>
        </div>

        <div className="p-6 rounded-2xl bg-black/40 border border-red-950 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-zinc-800">
            UPI QR & Bank A/C Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderFields(PAYMENT_FIELDS)}</div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { ganeshStore } from "@/lib/store";
import { Settings as SettingsType } from "@/types";
import { Settings, Save, Shield, QrCode, Landmark } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsType>(() => ganeshStore.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ganeshStore.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold">
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Association Info */}
        <div className="p-6 rounded-2xl bg-black/40 border border-red-950 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-zinc-800">
            Association Branding & Legal Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Association Name</label>
              <input
                type="text"
                value={settings.associationName}
                onChange={(e) => setSettings({ ...settings, associationName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Short Name / Title</label>
              <input
                type="text"
                value={settings.shortName}
                onChange={(e) => setSettings({ ...settings, shortName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Society Registration #</label>
              <input
                type="text"
                value={settings.registrationNo}
                onChange={(e) => setSettings({ ...settings, registrationNo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">80G Tax Exemption #</label>
              <input
                type="text"
                value={settings.tax80GNo}
                onChange={(e) => setSettings({ ...settings, tax80GNo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>
          </div>
        </div>
        {/* Payment & UPI */}
        <div className="p-6 rounded-2xl bg-black/40 border border-red-950 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-zinc-800">
            UPI QR & Bank A/C Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">UPI VPA (Virtual Payment Address)</label>
              <input
                type="text"
                value={settings.upiVpa}
                onChange={(e) => setSettings({ ...settings, upiVpa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Merchant / Payee Name</label>
              <input
                type="text"
                value={settings.upiName}
                onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">A/C Number</label>
              <input
                type="text"
                value={settings.bankAccountNo}
                onChange={(e) => setSettings({ ...settings, bankAccountNo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-900 text-white text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>
    </div>
  );
}

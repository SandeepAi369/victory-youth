"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import { addSponsor, updateSponsor, deleteSponsor, toggleSponsorPublish } from "./actions";
import { toast } from "sonner";

const TIERS = ["MAHA RAJA", "DIAMOND", "GOLD", "SILVER", "BRONZE", "OTHER"];

type Sponsor = {
  id: string; name: string; tier: string; amount: number;
  contactPerson: string | null; contactPhone: string | null;
  isPublished: boolean | null; displayOrder: number | null;
};

const emptyForm = { name: "", tier: "GOLD", amount: "", contactPerson: "", contactPhone: "", displayOrder: "1" };

export default function SponsorsClient({ initialData }: { initialData: Sponsor[] }) {
  const [data, setData] = useState<Sponsor[]>(initialData);
  useEffect(() => { setData(initialData); }, [initialData]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, tier: form.tier, amount: parseInt(form.amount), contactPerson: form.contactPerson || null, contactPhone: form.contactPhone || null, displayOrder: parseInt(form.displayOrder) || 1 };
    startTransition(async () => {
      const r = editingId ? await updateSponsor(editingId, payload) : await addSponsor(payload);
      if (r?.success) { toast.success(editingId ? "Sponsor updated" : "Sponsor added"); resetForm(); router.refresh(); }
      else { toast.error(r?.error || "Failed"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this sponsor?")) return;
    startTransition(async () => {
      const r = await deleteSponsor(id);
      if (r?.success) { toast.success("Deleted"); router.refresh(); } else { toast.error(r?.error || "Failed"); }
    });
  };

  const handleEdit = (s: Sponsor) => {
    setEditingId(s.id); setShowForm(true);
    setForm({ name: s.name, tier: s.tier, amount: String(s.amount), contactPerson: s.contactPerson || "", contactPhone: s.contactPhone || "", displayOrder: String(s.displayOrder || 1) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Sponsors</h1>
          <p className="text-muted-foreground text-sm">{data.length} sponsors registered.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e: any) => e.target === e.currentTarget && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Sponsor" : "New Sponsor"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Name</label><input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Sponsor name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-muted-foreground mb-1">Tier</label><select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2">{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-muted-foreground mb-1">Amount (₹)</label><input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-muted-foreground mb-1">Contact Person</label><input type="text" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-xs font-bold text-muted-foreground mb-1">Phone</label><input type="text" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
              </div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Display Order</label><input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">Sponsor</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map(s => (
                <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{s.name}</td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-xs">{s.tier}</span></td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{s.amount?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.contactPerson || "-"}<br/>{s.contactPhone || ""}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => startTransition(async () => { const r = await toggleSponsorPublish(s.id, !s.isPublished); if (r?.success) { toast.success(s.isPublished ? "Unpublished" : "Published"); router.refresh(); } })} disabled={isPending} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border ${s.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>{s.isPublished ? "PUBLISHED" : "DRAFT"}</button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

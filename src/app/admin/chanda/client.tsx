"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { addChanda, updateChanda, deleteChanda, toggleChandaPublish } from "./actions";
import { toast } from "sonner";

type Entry = {
  id: string; receiptNo: string | null; donorName: string; phone: string | null;
  amount: number; purpose: string | null; paymentMode: string | null;
  date: string | null; isPublished: boolean | null;
};

const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];
const emptyForm = { donorName: "", phone: "", amount: "", paymentMode: "CASH", date: new Date().toISOString().split("T")[0], purpose: "" };

export default function ChandaClient({ initialData }: { initialData: Entry[] }) {
  const [data, setData] = useState<Entry[]>(initialData);
  useEffect(() => { setData(initialData); }, [initialData]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const totalAmount = data.reduce((sum, e) => sum + (e.amount || 0), 0);
  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { donorName: form.donorName, phone: form.phone, amount: parseInt(form.amount) || 0, paymentMode: form.paymentMode, date: form.date, purpose: form.purpose || "Chanda" };
    startTransition(async () => {
      const r = editingId ? await updateChanda(editingId, payload) : await addChanda(payload);
      if (r?.success) { toast.success(editingId ? "Updated" : "Chanda added"); resetForm(); router.refresh(); }
      else { toast.error(r?.error || "Failed"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this chanda entry?")) return;
    const prev = data;
    setData(data.filter(d => d.id !== id));
    startTransition(async () => {
      const r = await deleteChanda(id);
      if (r?.success) { toast.success("Deleted"); router.refresh(); }
      else { setData(prev); toast.error(r?.error || "Delete failed"); }
    });
  };

  const handleEdit = (e: Entry) => {
    setEditingId(e.id); setShowForm(true);
    setForm({ donorName: e.donorName, phone: e.phone || "", amount: String(e.amount), paymentMode: e.paymentMode || "CASH", date: e.date || new Date().toISOString().split("T")[0], purpose: e.purpose || "" });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    const prev = data;
    setData(data.map(d => d.id === id ? { ...d, isPublished: !current } : d));
    startTransition(async () => {
      const r = await toggleChandaPublish(id, !current);
      if (r?.success) { toast.success(current ? "Unpublished" : "Published"); router.refresh(); }
      else { setData(prev); toast.error(r?.error || "Toggle failed"); }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Chanda (Donations)</h1>
          <p className="text-muted-foreground text-sm">{data.length} entries · Total: ₹{totalAmount.toLocaleString("en-IN")}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} disabled={isPending} className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Chanda
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e: any) => e.target === e.currentTarget && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Chanda" : "New Chanda Entry"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Donor Name *</label>
                <input type="text" required value={form.donorName} onChange={e => setForm({ ...form, donorName: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Amount (₹) *</label>
                  <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="5000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Payment Mode</label>
                  <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2">
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Purpose</label>
                <input type="text" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="e.g. Monthly Chanda" />
              </div>
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
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No chanda entries yet.</td></tr>
              )}
              {data.map(e => (
                <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{e.donorName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{e.receiptNo || e.id}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{e.amount?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{(e.paymentMode || "CASH").replace("_", " ")}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{e.date || "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(e.id, !!e.isPublished)} disabled={isPending}
                      className={"px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 " + (e.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                      {e.isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(e)} disabled={isPending} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(e.id)} disabled={isPending} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
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

"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, User, UserX } from "lucide-react";
import { addChanda, updateChanda, deleteChanda, toggleChandaPublish, toggleChandaAnonymous, setAllChandaVisibility } from "./actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";

type Entry = {
  id: string; receiptNo: string | null; donorName: string; phone: string | null;
  amount: number; purpose: string | null; paymentMode: string | null;
  date: string | null; isPublished: boolean | null; isAnonymous: boolean | null;
};

const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];
const emptyForm = { donorName: "", phone: "", amount: "", paymentMode: "CASH", date: new Date().toISOString().split("T")[0], purpose: "", isAnonymous: false };

export default function ChandaClient({ initialData }: { initialData: Entry[] }) {
  const { data, isPending, execute } = useAdminAction<Entry>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const totalAmount = data.reduce((sum, e) => sum + (e.amount || 0), 0);
  const isAllPublished = data.length > 0 && data.every((e) => e.isPublished);
  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((d) => ({ ...d, isPublished: newState })),
      serverAction: () => setAllChandaVisibility(newState),
      successMsg: newState ? "All chanda entries published" : "All chanda entries unpublished",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { isAnonymous: form.isAnonymous, donorName: form.donorName, phone: form.phone, amount: parseInt(form.amount) || 0, paymentMode: form.paymentMode, date: form.date, purpose: form.purpose || "Monthly Chanda" };
    execute({
      serverAction: () => editingId ? updateChanda(editingId, payload) : addChanda(payload),
      successMsg: editingId ? "Updated" : "Chanda added",
      onSuccess: resetForm,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this entry?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((d) => d.id !== id),
      serverAction: () => deleteChanda(id),
      successMsg: "Deleted",
    });
  };

  const handleEdit = (e: Entry) => {
    setEditingId(e.id); setShowForm(true);
    setForm({ donorName: e.donorName, phone: e.phone || "", amount: String(e.amount), paymentMode: e.paymentMode || "CASH", date: e.date || new Date().toISOString().split("T")[0], purpose: e.purpose || "", isAnonymous: !!e.isAnonymous });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.id === id ? { ...d, isPublished: !current } : d),
      serverAction: () => toggleChandaPublish(id, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  const handleToggleAnonymous = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((d) => d.id === id ? { ...d, isAnonymous: !current } : d),
      serverAction: () => toggleChandaAnonymous(id, !current),
      successMsg: current ? "Name will be shown publicly" : "Name hidden — shown as Anonymous",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Chanda (Donations)</h1>
          <p className="text-muted-foreground text-sm">Chanda Collections</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {data.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <div className="w-px h-6 bg-border" />
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} disabled={isPending}
            className={"px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 transition-all " + (isPending ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:opacity-90")}>
            <Plus className="w-4 h-4" /> Add Chanda
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Chanda" : "New Chanda"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Donor Name *</label>
                <input type="text" required value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Amount (₹) *</label>
                  <input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Payment Mode</label>
                  <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2">
                    {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Date *</label>
                  <input type="date" required value={form.date} readOnly className="w-full bg-background border rounded-lg px-3 py-2 cursor-not-allowed opacity-70" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Purpose</label>
                <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Monthly Chanda" />
              </div>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} className="mt-0.5" />
                <span>
                  <span className="font-bold">Anonymous donor</span>
                  <span className="block text-xs text-muted-foreground">The name is never shown on the public site; it appears as &quot;Anonymous Devotee&quot;.</span>
                </span>
              </label>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">
                  {isPending ? "Saving..." : "Save"}
                </button>
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
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No chanda entries yet.</td></tr>}
              {data.map((e) => (
                <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{e.donorName}</p>
                    {e.isAnonymous && <p className="text-[10px] font-bold text-violet-600 flex items-center gap-1"><UserX className="w-3 h-3" /> Anonymous on public site</p>}
                    {e.receiptNo && <p className="text-[10px] text-muted-foreground font-mono">{e.receiptNo}</p>}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{e.amount?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{e.date || "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(e.id, !!e.isPublished)} disabled={isPending}
                      className={"px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 " + (e.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                      {e.isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>
                    <button onClick={() => handleToggleAnonymous(e.id, !!e.isAnonymous)} disabled={isPending} title="Hide or show the donor's name on the public site"
                      className={"ml-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 inline-flex items-center gap-1 " + (e.isAnonymous ? "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                      {e.isAnonymous ? <UserX className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {e.isAnonymous ? "ANONYMOUS" : "NAMED"}
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

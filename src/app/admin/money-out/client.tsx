"use client";

import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { addExpense, updateExpense, deleteExpense, toggleExpensePublish } from "./actions";
import { toast } from "sonner";

type Expense = { id: string; voucherNo: string; title: string | null; category: string; amount: number; paidTo: string | null; vendorName: string | null; mode: string | null; date: string; status: string | null; isPublished: boolean | null };

const EXP_CATEGORIES = ["Decoration", "Sound System", "Prasadam", "Electricity", "Vedic Pooja", "Transport", "Catering", "Miscellaneous"];

export default function MoneyOutClient({ initialData }: { initialData: Expense[] }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Miscellaneous");
  const [paidTo, setPaidTo] = useState("");
  const [mode, setMode] = useState("CASH");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => { setTitle(""); setAmount(""); setCategory("Miscellaneous"); setPaidTo(""); setMode("CASH"); setDate(new Date().toISOString().split("T")[0]); setEditingId(null); setShowForm(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    startTransition(async () => {
      if (editingId) {
        const res = await updateExpense(editingId, { title, amount: Number(amount), category, paidTo, mode, date });
        if (res.success) { toast.success("Updated"); resetForm(); router.refresh(); }
        else toast.error(res.error || "Failed");
      } else {
        const res = await addExpense({ title, amount: Number(amount), category, paidTo, mode, date });
        if (res.success) { toast.success("Expense added"); resetForm(); router.refresh(); }
        else toast.error(res.error || "Failed");
      }
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleExpensePublish(id, !current);
      toast.success(current ? "Unpublished" : "Published");
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    startTransition(async () => { const r = await deleteExpense(id); router.refresh(); if (r.success) { toast.success("Deleted");  } });
  };

  const handleEdit = (e: Expense) => {
    setTitle(e.title || ""); setAmount(String(e.amount)); setCategory(e.category);
    setPaidTo(e.paidTo || e.vendorName || ""); setMode(e.mode || "CASH"); setDate(e.date); setEditingId(e.id); setShowForm(true);
  };

  const filtered = initialData.filter(e => (e.title || "").toLowerCase().includes(query.toLowerCase()) || e.voucherNo.toLowerCase().includes(query.toLowerCase()));
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Money Out (Expenses)</h1><p className="text-sm text-muted-foreground">All outgoing payments and expenses</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Expense</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Description *" required className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount *" required className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              {EXP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={paidTo} onChange={e => setPaidTo(e.target.value)} placeholder="Paid To" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <select value={mode} onChange={e => setMode(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CHEQUE">Cheque</option>
            </select>
            <input value={date} onChange={e => setDate(e.target.value)} type="date" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm">{isPending ? "Saving..." : editingId ? "Update" : "Save"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <span className="text-sm">Total: <strong className="text-red-600">₹{total.toLocaleString("en-IN")}</strong></span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr className="text-left text-muted-foreground"><th className="p-3">Voucher</th><th className="p-3">Description</th><th className="p-3">Category</th><th className="p-3">Paid To</th><th className="p-3">Amount</th><th className="p-3">Date</th><th className="p-3">Visible</th>
              <th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No expenses yet</td></tr>}
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{e.voucherNo}</td>
                <td className="p-3 font-medium">{e.title}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">{e.category}</span></td>
                <td className="p-3 text-muted-foreground">{e.paidTo || e.vendorName || "-"}</td>
                <td className="p-3 font-bold text-red-600">₹{e.amount.toLocaleString("en-IN")}</td>
                <td className="p-3 text-muted-foreground">{e.date}</td>
                <td className="p-3">
                  <button onClick={() => handleTogglePublish(e.id, !!e.isPublished)} disabled={isPending} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border ${e.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>{e.isPublished ? "PUBLISHED" : "DRAFT"}</button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(e)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

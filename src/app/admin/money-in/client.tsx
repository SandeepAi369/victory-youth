"use client";
// useEffect added for prop sync

import { useRouter } from "next/navigation";

import { useState, useTransition, useEffect } from "react";
import { Plus, Search, Eye, EyeOff, Edit, Trash2, Loader2, CheckSquare } from "lucide-react";
import { addMoneyIn, updateMoneyIn, deleteMoneyIn, togglePublish, bulkTogglePublish } from "./actions";
import { toast } from "sonner";

type Entry = {
  id: string; receiptNo: string; donorName: string; phone: string;
  amount: number; category: string | null; purpose: string | null;
  paymentMode: string | null; date: string | null; isPublished: boolean | null;
};

const CATEGORIES = ["CHANDA", "DONATION", "SPONSORSHIP", "ANNADANAM", "OTHER"];
const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];

export default function MoneyInClient({ initialData }: { initialData: Entry[] }) {
  const [data, setData] = useState<Entry[]>(initialData);
  useEffect(() => { setData(initialData); }, [initialData]);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("CHANDA");
  const [purpose, setPurpose] = useState("");
  const [mode, setMode] = useState("CASH");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => {
    setName(""); setPhone(""); setAmount(""); setCategory("CHANDA");
    setPurpose(""); setMode("CASH"); setDate(new Date().toISOString().split("T")[0]);
    setEditingId(null); setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    startTransition(async () => {
      if (editingId) {
        const res = await updateMoneyIn(editingId, { donorName: name, phone, amount: Number(amount), category, purpose, paymentMode: mode, date });
        if (res.success) { toast.success("Updated"); resetForm(); router.refresh(); }
        else toast.error(res.error || "Failed");
      } else {
        const res = await addMoneyIn({ donorName: name, phone, amount: Number(amount), category, purpose, paymentMode: mode, date });
        if (res.success) { toast.success("Entry added"); resetForm(); router.refresh(); }
        else toast.error(res.error || "Failed");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this entry?")) return;
    startTransition(async () => {
      const res = await deleteMoneyIn(id);
      if (res.success) { toast.success("Deleted"); router.refresh(); }
      else toast.error(res.error || "Failed");
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePublish("donations", id, !current);
      toast.success(current ? "Unpublished" : "Published"); router.refresh(); });
  };

  const handleBulkPublish = (publish: boolean) => {
    const cat = catFilter === "ALL" ? undefined : catFilter;
    startTransition(async () => {
      await bulkTogglePublish("donations", publish, cat);
      toast.success(publish ? `Published all ${cat || "entries"}` : `Unpublished all ${cat || "entries"}`); router.refresh(); });
  };

  const handleEdit = (entry: Entry) => {
    setName(entry.donorName); setPhone(entry.phone || "");
    setAmount(String(entry.amount)); setCategory(entry.category || "CHANDA");
    setPurpose(entry.purpose || ""); setMode(entry.paymentMode || "CASH");
    setDate(entry.date || ""); setEditingId(entry.id); setShowForm(true);
  };

  const filtered = data.filter((d) => {
    const matchesQuery = d.donorName.toLowerCase().includes(query.toLowerCase()) ||
      d.receiptNo.toLowerCase().includes(query.toLowerCase());
    const matchesCat = catFilter === "ALL" || d.category === catFilter;
    return matchesQuery && matchesCat;
  });

  const totalAmount = filtered.reduce((s, d) => s + (d.amount || 0), 0);
  const publishedAmount = filtered.filter(d => d.isPublished).reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Money In (Income)</h1>
          <p className="text-sm text-muted-foreground">Chanda, Donations, Sponsorships — all in one place</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-foreground">{editingId ? "Edit Entry" : "New Income Entry"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Donor Name *" required className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount *" required className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Purpose (optional)" className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            <select value={mode} onChange={e => setMode(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input value={date} onChange={e => setDate(e.target.value)} type="date" className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => handleBulkPublish(true)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium flex items-center gap-1 hover:bg-emerald-700">
            <Eye className="w-3 h-3" /> Publish All
          </button>
          <button onClick={() => handleBulkPublish(false)} className="px-3 py-2 rounded-lg bg-stone-600 text-white text-xs font-medium flex items-center gap-1 hover:bg-stone-700">
            <EyeOff className="w-3 h-3" /> Unpublish All
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex gap-4 p-3 rounded-lg bg-muted/50 border text-sm">
        <span><strong>{filtered.length}</strong> entries</span>
        <span>Total: <strong className="text-emerald-600">₹{totalAmount.toLocaleString("en-IN")}</strong></span>
        <span>Published: <strong className="text-blue-600">₹{publishedAmount.toLocaleString("en-IN")}</strong></span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Receipt</th><th className="p-3">Name</th><th className="p-3">Category</th>
              <th className="p-3">Amount</th><th className="p-3">Mode</th><th className="p-3">Date</th>
              <th className="p-3">Visible</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{d.receiptNo}</td>
                <td className="p-3 font-medium">{d.donorName}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{d.category}</span></td>
                <td className="p-3 font-bold text-emerald-600">₹{d.amount.toLocaleString("en-IN")}</td>
                <td className="p-3 text-muted-foreground">{d.paymentMode}</td>
                <td className="p-3 text-muted-foreground">{d.date}</td>
                <td className="p-3">
                  <button onClick={() => handleTogglePublish(d.id, !!d.isPublished)} disabled={isPending} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border ${d.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>{d.isPublished ? "PUBLISHED" : "DRAFT"}</button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
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

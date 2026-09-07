"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { addInventoryItem, updateInventoryItem, deleteInventoryItem } from "./actions";
import { exportInventoryToExcel } from "@/lib/excel-exporter";

export function InventoryClient({ items }: { items: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", category: "Silver", quantity: 1, condition: "Good", inCharge: "", unit: "pcs" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) await updateInventoryItem(editingId, formData);
      else await addInventoryItem(formData);
      setIsAdding(false); setEditingId(null); router.refresh(); });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this item?")) return;
    startTransition(async () => { await deleteInventoryItem(id); router.refresh(); });
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    (i.inCharge || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black gold-gradient-text">Inventory Assets</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Manage assets & pooja samagri stock</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportInventoryToExcel(items)} className="px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-black">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", category: "Silver", quantity: 1, condition: "Good", inCharge: "", unit: "pcs" }); }} className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 bg-card border rounded-xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Item Name" className="px-3 py-2 border rounded-lg" />
            <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Category" className="px-3 py-2 border rounded-lg" />
            <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} placeholder="Quantity" className="px-3 py-2 border rounded-lg" />
            <input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Unit (pcs, kg)" className="px-3 py-2 border rounded-lg" />
            <input required value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} placeholder="Condition" className="px-3 py-2 border rounded-lg" />
            <input value={formData.inCharge} onChange={e => setFormData({...formData, inCharge: e.target.value})} placeholder="In-Charge" className="px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background" />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Custodian</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-all">
                  <td className="py-3 px-4 font-bold">{item.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                  <td className="py-3 px-4 font-bold">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">{item.condition}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{item.inCharge}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditingId(item.id); setIsAdding(false); setFormData({ name: item.name, category: item.category, quantity: item.quantity, condition: item.condition, inCharge: item.inCharge || "", unit: item.unit || "pcs" }); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

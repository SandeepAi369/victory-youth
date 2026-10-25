"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Download, X } from "lucide-react";
import { addInventoryItem, updateInventoryItem, deleteInventoryItem } from "./actions";
import type { getInventory } from "./actions";

type Row = Awaited<ReturnType<typeof getInventory>>[number];
import { exportInventoryToExcel } from "@/lib/excel-exporter";
import { useAdminAction } from "@/lib/hooks/useAdminAction";

export function InventoryClient({ items: initialItems }: { items: Row[] }) {
  const { data: items, isPending, execute } = useAdminAction(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "", category: "Silver", quantity: 1, condition: "Good", inCharge: "", unit: "pcs",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({
      serverAction: () => editingId ? updateInventoryItem(editingId, formData) : addInventoryItem(formData),
      successMsg: editingId ? "Item updated" : "Item added",
      onSuccess: () => { setIsAdding(false); setEditingId(null); },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this item?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((i) => i.id !== id),
      serverAction: () => deleteInventoryItem(id),
      successMsg: "Item deleted",
    });
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      (i.inCharge || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Inventory Assets</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage assets & pooja samagri stock</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportInventoryToExcel(items)}
            className="px-3.5 py-2 rounded-xl bg-muted border border-border text-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-muted/80">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => {
              setIsAdding(true); setEditingId(null);
              setFormData({ name: "", category: "Silver", quantity: 1, condition: "Good", inCharge: "", unit: "pcs" });
            }} disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && (() => { setIsAdding(false); setEditingId(null); })()}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {editingId ? "Edit Inventory Item" : "New Inventory Item"}
              </h3>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Item Name" className="px-3 py-2 border rounded-lg bg-background" />
                <input required value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Category" className="px-3 py-2 border rounded-lg bg-background" />
                <input required type="number" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  placeholder="Quantity" className="px-3 py-2 border rounded-lg bg-background" />
                <input required value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Unit (pcs, kg)" className="px-3 py-2 border rounded-lg bg-background" />
                <input required value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Condition" className="px-3 py-2 border rounded-lg bg-background" />
                <input value={formData.inCharge}
                  onChange={(e) => setFormData({ ...formData, inCharge: e.target.value })}
                  placeholder="In-Charge" className="px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">
                  {isPending ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background" />
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
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{item.inCharge}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => {
                          setEditingId(item.id); setIsAdding(false);
                          setFormData({ name: item.name, category: item.category,
                            quantity: item.quantity, condition: item.condition || "Good",
                            inCharge: item.inCharge || "", unit: item.unit || "pcs" });
                        }} disabled={isPending}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={isPending}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

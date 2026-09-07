"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { addGalleryItem, updateGalleryItem, deleteGalleryItem } from "./actions";

export function GalleryClient({ gallery }: { gallery: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState({ title: "", url: "", category: "General", year: 2026 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) await updateGalleryItem(editingId, formData);
      else await addGalleryItem(formData);
      setIsAdding(false); setEditingId(null); router.refresh(); });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this photo?")) return;
    startTransition(async () => { await deleteGalleryItem(id); router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Gallery</h1>
          <p className="text-muted-foreground text-sm">Upload photos and videos.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: "", url: "", category: "General", year: 2026 }); }} className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 bg-card border rounded-xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" className="px-3 py-2 border rounded-lg" />
            <input required type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="Image URL" className="px-3 py-2 border rounded-lg" />
            <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} placeholder="Year" className="px-3 py-2 border rounded-lg" />
            <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Category" className="px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.map(item => (
          <div key={item.id} className="relative rounded-xl border bg-card overflow-hidden group">
            <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-3">
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.year} • {item.category}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingId(item.id); setIsAdding(false); setFormData({ title: item.title, url: item.url, category: item.category || "General", year: item.year || 2026 }); }} className="p-1.5 bg-white text-blue-600 rounded-lg shadow"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded-lg shadow"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

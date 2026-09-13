"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { addGalleryItem, updateGalleryItem, deleteGalleryItem, toggleGalleryPublish, setAllGalleryVisibility } from "./actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";

export function GalleryClient({ gallery: initialGallery }: { gallery: any[] }) {
  const { data: gallery, isPending, execute } = useAdminAction(initialGallery);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", url: "", category: "General", year: 2026 });

  const isAllPublished = gallery.length > 0 && gallery.every((g: any) => g.isPublished);

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((g: any) => ({ ...g, isPublished: newState })),
      serverAction: () => setAllGalleryVisibility(newState),
      successMsg: newState ? "All gallery images published" : "All gallery images unpublished",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({
      serverAction: () => editingId ? updateGalleryItem(editingId, formData) : addGalleryItem(formData),
      successMsg: editingId ? "Updated" : "Added",
      onSuccess: () => { setIsAdding(false); setEditingId(null); },
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((g: any) => g.id === id ? { ...g, isPublished: !current } : g),
      serverAction: () => toggleGalleryPublish(id, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this image?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((g: any) => g.id !== id),
      serverAction: () => deleteGalleryItem(id),
      successMsg: "Deleted",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground text-sm">Manage event photos</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {gallery.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: "", url: "", category: "General", year: 2026 }); }}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Image
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && (() => { setIsAdding(false); setEditingId(null); })()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Image" : "New Image"}</h2>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Title *</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Image title" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Image URL *</label>
                <input type="url" required value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Category</label>
                  <input type="text" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Year</label>
                  <input type="number" value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No images yet.</p>}
        {gallery.map((g: any) => (
          <div key={g.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm group">
            {g.url && <img src={g.url} alt={g.title} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{g.title}</h3>
                <button onClick={() => handleTogglePublish(g.id, !!g.isPublished)} disabled={isPending}
                  className={"px-2 py-0.5 rounded-full text-[10px] font-bold border disabled:opacity-50 " +
                    (g.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200")}>
                  {g.isPublished ? "PUBLISHED" : "DRAFT"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{g.category} · {g.year}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => {
                  setEditingId(g.id); setIsAdding(false);
                  setFormData({ title: g.title, url: g.url || "", category: g.category || "General", year: g.year || 2026 });
                }} disabled={isPending} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(g.id)} disabled={isPending}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

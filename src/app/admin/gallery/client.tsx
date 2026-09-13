"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { addGalleryItem, updateGalleryItem, deleteGalleryItem, toggleGalleryPublish, setAllGalleryVisibility } from "./actions";
import { toast } from "sonner";

export function GalleryClient({ gallery: initialGallery }: { gallery: any[] }) {
  const router = useRouter();
  const [gallery, setGallery] = useState(initialGallery);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fire YouTube-style top loading bar in admin layout
  useEffect(() => {
    if (isPending) {
      window.dispatchEvent(new Event("admin-loading-start"));
    } else {
      window.dispatchEvent(new Event("admin-loading-end"));
    }
  }, [isPending]);

  const [formData, setFormData] = useState({ title: "", url: "", category: "General", year: 2026 });

  // Master toggle state: derived from live data
  const publishedCount = gallery.filter((g) => g.isPublished).length;
  const isAllPublished = gallery.length > 0 && publishedCount === gallery.length;

  /** Master toggle — publish or unpublish ALL gallery images */
  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    startTransition(async () => {
      const r = await setAllGalleryVisibility(newState);
      if (r?.success) {
        toast.success(newState ? "All gallery images published" : "All gallery images unpublished");
        router.refresh();
      } else {
        toast.error(r?.error || "Failed");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = editingId ? await updateGalleryItem(editingId, formData) : await addGalleryItem(formData);
      if (r?.success) {
        toast.success(editingId ? "Updated" : "Added");
        setIsAdding(false); setEditingId(null);
        router.refresh();
      } else {
        toast.error(r?.error || "Failed");
      }
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    setGallery((prev) => prev.map((g) => g.id === id ? { ...g, isPublished: !current } : g));
    startTransition(async () => {
      const r = await toggleGalleryPublish(id, !current);
      if (r?.success) { toast.success(current ? "Unpublished" : "Published"); router.refresh(); }
      else { router.refresh(); toast.error(r?.error || "Toggle failed"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this image?")) return;
    setGallery((prev) => prev.filter((g) => g.id !== id));
    startTransition(async () => {
      const r = await deleteGalleryItem(id);
      if (r?.success) { toast.success("Deleted"); router.refresh(); }
      else { router.refresh(); toast.error(r?.error || "Delete failed"); }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground text-sm">Gallery</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* ── MASTER TOGGLE for Gallery category ── */}
          {gallery.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all disabled:opacity-50 " +
                (isAllPublished
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: "", url: "", category: "General", year: 2026 }); }}
            disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Image
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && (() => { setIsAdding(false); setEditingId(null); })()}>
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Image" : "Add Image"}</h2>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {gallery.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No images yet.</div>
        )}
        {gallery.map((img: any) => (
          <div key={img.id} className="group relative rounded-xl overflow-hidden border bg-card">
            <div className="aspect-square bg-muted overflow-hidden">
              <img src={img.url} alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-3">
              <p className="font-bold text-sm text-foreground truncate">{img.title}</p>
              <p className="text-xs text-muted-foreground">{img.category} · {img.year}</p>
              <div className="flex items-center gap-1 mt-2">
                <button onClick={() => handleTogglePublish(img.id, !!img.isPublished)} disabled={isPending}
                  className={"flex-1 px-2 py-1 rounded-lg text-[10px] font-bold border disabled:opacity-50 " +
                    (img.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200")}>
                  {img.isPublished ? "PUBLISHED" : "DRAFT"}
                </button>
                <button onClick={() => { setEditingId(img.id); setIsAdding(false);
                    setFormData({ title: img.title, url: img.url, category: img.category, year: img.year }); }}
                  disabled={isPending} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(img.id)} disabled={isPending}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

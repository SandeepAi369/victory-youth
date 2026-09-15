"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadGalleryImage, updateGalleryItem, deleteGalleryItem, toggleGalleryPublish, setAllGalleryVisibility } from "./actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";

export function GalleryClient({ gallery: initialGallery }: { gallery: any[] }) {
  const { data: gallery, isPending, execute } = useAdminAction(initialGallery);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Upload form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [year, setYear] = useState(2026);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAllPublished = gallery.length > 0 && gallery.every((g: any) => g.isPublished);

  const resetForm = () => {
    setTitle(""); setCategory("General"); setYear(2026); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setIsAdding(false); setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Please select an image file.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || "Untitled");
      formData.append("category", category);
      formData.append("year", String(year));

      const result = await uploadGalleryImage(formData);
      if (result.success) {
        resetForm();
        window.location.reload();
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    execute({
      serverAction: () => updateGalleryItem(editingId, { title, category, year }),
      successMsg: "Updated",
      onSuccess: resetForm,
    });
  };

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((g: any) => ({ ...g, isPublished: newState })),
      serverAction: () => setAllGalleryVisibility(newState),
      successMsg: newState ? "All published" : "All unpublished",
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
    if (!confirm("Delete this image? This will also remove it from Cloudflare.")) return;
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
          <p className="text-muted-foreground text-sm">Upload & manage event photos via Cloudflare Images</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {gallery.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending ? "opacity-50 cursor-not-allowed" :
                  isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); setIsAdding(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Image
          </button>
        </div>
      </div>

      {/* ── Upload / Edit Modal ── */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Image Details" : "Upload New Image"}</h2>
              <button type="button" onClick={resetForm}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={editingId ? handleEditSubmit : handleUpload} className="space-y-4">
              {/* File picker — only for new uploads */}
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Image File *</label>
                  <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                    {preview ? (
                      <div className="space-y-3">
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                        <p className="text-xs text-muted-foreground">Click below to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                        <p className="text-sm text-muted-foreground">Click to select an image</p>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-3 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Title *</label>
                <input type="text" required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Image title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Category</label>
                  <input type="text" value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Year</label>
                  <input type="number" value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={uploading || isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                  {(uploading || isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Save Changes" : uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Gallery Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No images yet. Click "Upload Image" to add your first photo.</p>}
        {gallery.map((g: any) => (
          <div key={g.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm group">
            {g.url && <img src={g.url} alt={g.title} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm truncate">{g.title}</h3>
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
                  setTitle(g.title || ""); setCategory(g.category || "General"); setYear(g.year || 2026);
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

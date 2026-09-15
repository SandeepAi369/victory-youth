"use client";

import { useState, useRef } from "react";
import { Trash2, X, Eye, EyeOff, Upload, Image as ImageIcon, Loader2, RefreshCw, Check, CloudUpload } from "lucide-react";
import { getDirectUploadUrl, saveGalleryImage, replaceGalleryImage, deleteGalleryItem, toggleGalleryPublish, setAllGalleryVisibility } from "./actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";

export function GalleryClient({ gallery: initialGallery }: { gallery: any[] }) {
  const { data: gallery, isPending, execute } = useAdminAction(initialGallery);
  const [isAdding, setIsAdding] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 2-step state
  const [step, setStep] = useState<"select" | "uploading" | "uploaded" | "saving">("select");
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const [category, setCategory] = useState("General");
  const [year, setYear] = useState(2026);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAllPublished = gallery.length > 0 && gallery.every((g: any) => g.isPublished);
  const isBusy = step === "uploading" || step === "saving";

  const resetForm = () => {
    setCategory("General"); setYear(2026); setPreview(null);
    setIsAdding(false); setReplacingId(null);
    setStep("select"); setUploadedImageId(null); setUploadedUrl(null); setStatusMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      // Reset upload state when new file selected
      setStep("select"); setUploadedImageId(null); setUploadedUrl(null); setStatusMsg("");
    }
  };

  // ── STEP 1: Upload file to Cloudflare ──
  const handleUploadToCF = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Please select an image file first.");

    setStep("uploading");
    try {
      setStatusMsg("Getting upload URL...");
      const urlResult = await getDirectUploadUrl();
      if (!urlResult.success || !urlResult.uploadUrl || !urlResult.imageId) {
        throw new Error(urlResult.error || "Failed to get upload URL");
      }

      setStatusMsg("Uploading to Cloudflare...");
      const cfForm = new FormData();
      cfForm.append("file", file);

      const cfRes = await fetch(urlResult.uploadUrl, {
        method: "POST",
        body: cfForm,
      });

      if (!cfRes.ok) {
        const errText = await cfRes.text();
        throw new Error("Cloudflare upload failed: " + errText);
      }

      // Upload confirmed!
      const cfImageId = urlResult.imageId;
      const deliveryUrl = `https://imagedelivery.net/g0kMHlYRsoNb1rbpdz3L7g/${cfImageId}/public`;
      setUploadedImageId(cfImageId);
      setUploadedUrl(deliveryUrl);
      setStep("uploaded");
      setStatusMsg("");
    } catch (err: any) {
      setStep("select");
      alert("Upload error: " + err.message);
    }
  };

  // ── STEP 2: Save confirmed image to database ──
  const handleSaveToDB = async () => {
    if (!uploadedImageId) return;
    setStep("saving");
    setStatusMsg("Saving to database...");

    try {
      if (replacingId) {
        const result = await replaceGalleryImage(replacingId, uploadedImageId);
        if (!result.success) throw new Error(result.error || "Failed to replace");
      } else {
        const result = await saveGalleryImage(uploadedImageId, category, year);
        if (!result.success) throw new Error(result.error || "Failed to save");
      }
      resetForm();
      window.location.reload();
    } catch (err: any) {
      setStep("uploaded"); // Go back to uploaded state so they can retry save
      alert("Save error: " + err.message);
    }
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
    if (!confirm("Delete this image permanently?")) return;
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
          <p className="text-muted-foreground text-sm">Upload & manage photos via Cloudflare Images</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {gallery.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending ? "opacity-50 cursor-not-allowed" :
                  isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { resetForm(); setIsAdding(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Image
          </button>
        </div>
      </div>

      {/* ══ Upload / Replace Modal ══ */}
      {(isAdding || replacingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && !isBusy && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{replacingId ? "Replace Image" : "Upload New Image"}</h2>
              <button type="button" onClick={() => !isBusy && resetForm()}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* ── File Picker ── */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {replacingId ? "New Image *" : "Image File *"}
                </label>
                <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                  {uploadedUrl ? (
                    <div className="space-y-3">
                      <img src={uploadedUrl} alt="Uploaded" className="max-h-48 mx-auto rounded-lg object-contain" />
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-sm font-bold">
                        <Check className="w-4 h-4" /> Uploaded to Cloudflare
                      </div>
                    </div>
                  ) : preview ? (
                    <div className="space-y-3">
                      <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                      <p className="text-xs text-muted-foreground">Local preview — not uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to select an image</p>
                    </div>
                  )}
                  {step === "select" && (
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
                      className="mt-3 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                  )}
                </div>
              </div>

              {/* ── Category + Year (new uploads only) ── */}
              {!replacingId && (
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
              )}

              {/* ── Status Message ── */}
              {statusMsg && (
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {statusMsg}
                </div>
              )}

              {/* ── Confirmed URL display ── */}
              {uploadedUrl && step === "uploaded" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 break-all">
                  ✅ {uploadedUrl}
                </div>
              )}

              {/* ── Action Buttons ── */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={() => !isBusy && resetForm()} disabled={isBusy}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl disabled:opacity-50">Cancel</button>

                {/* STEP 1: Upload to Cloudflare */}
                {step === "select" && (
                  <button type="button" onClick={handleUploadToCF}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700">
                    <CloudUpload className="w-4 h-4" /> Upload to Cloud
                  </button>
                )}

                {step === "uploading" && (
                  <button disabled className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl opacity-50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </button>
                )}

                {/* STEP 2: Save to Database */}
                {step === "uploaded" && (
                  <button type="button" onClick={handleSaveToDB}
                    className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700">
                    <Check className="w-4 h-4" /> Save to Gallery
                  </button>
                )}

                {step === "saving" && (
                  <button disabled className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl opacity-50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Gallery Grid ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No images yet. Click &quot;Upload Image&quot; to add your first photo.</p>}
        {gallery.map((g: any) => (
          <div key={g.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm group relative">
            {g.url && <img src={g.url} alt="Gallery" className="w-full h-48 object-cover" />}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{g.category} · {g.year}</p>
                <button onClick={() => handleTogglePublish(g.id, !!g.isPublished)} disabled={isPending}
                  className={"px-2 py-0.5 rounded-full text-[10px] font-bold border disabled:opacity-50 " +
                    (g.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200")}>
                  {g.isPublished ? "PUBLISHED" : "DRAFT"}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { resetForm(); setReplacingId(g.id); }}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg disabled:opacity-50 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Replace
                </button>
                <button onClick={() => handleDelete(g.id)} disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

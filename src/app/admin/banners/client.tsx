"use client";
import { errorMessage } from "@/lib/utils";

import { useState, useRef } from "react";
import { Trash2, X, Upload, Image as ImageIcon, Loader2, RefreshCw, Check, CloudUpload, Pencil } from "lucide-react";
import { saveBanner, replaceBannerImage, deleteBanner, toggleBannerPublish, updateBannerLabel } from "./actions";
import type { getBanners } from "./actions";

type Row = Awaited<ReturnType<typeof getBanners>>[number];
import { useAdminAction } from "@/lib/hooks/useAdminAction";

import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET as UPLOAD_PRESET } from "@/lib/cloudinary-config";
const MAX_BANNERS = 3;

export function BannersClient({ banners: initialBanners }: { banners: Row[] }) {
  const { data: banners, isPending, execute } = useAdminAction(initialBanners);
  const [isAdding, setIsAdding] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [step, setStep] = useState<"select" | "uploading" | "uploaded" | "saving">("select");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const [label, setLabel] = useState("");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isBusy = step === "uploading" || step === "saving";
  const canAddMore = banners.length < MAX_BANNERS;

  const resetForm = () => {
    setLabel(""); setPreview(null);
    setIsAdding(false); setReplacingId(null);
    setStep("select"); setUploadedUrl(null); setUploadedPublicId(null); setStatusMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setStep("select"); setUploadedUrl(null); setUploadedPublicId(null);
    }
  };

  const handleUploadToCloudinary = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Please select an image file first.");
    setStep("uploading"); setStatusMsg("Uploading to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "Upload failed");
      if (!data.secure_url) throw new Error("No URL returned");
      setUploadedUrl(data.secure_url);
      setUploadedPublicId(data.public_id);
      setStep("uploaded"); setStatusMsg("");
    } catch (err) {
      setStep("select"); setStatusMsg("");
      alert("Upload error: " + errorMessage(err));
    }
  };

  const handleSaveToDB = async () => {
    if (!uploadedUrl || !uploadedPublicId) return;
    setStep("saving"); setStatusMsg("Saving to database...");
    try {
      if (replacingId) {
        const result = await replaceBannerImage(replacingId, uploadedUrl, uploadedPublicId);
        if (!result.success) throw new Error(result.error || "Failed to replace");
      } else {
        const result = await saveBanner(uploadedUrl, uploadedPublicId, label);
        if (!result.success) throw new Error(result.error || "Failed to save");
      }
      resetForm();
      window.location.reload();
    } catch (err) {
      setStep("uploaded"); setStatusMsg("");
      alert("Save error: " + errorMessage(err));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this banner permanently?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((b) => b.id !== id),
      serverAction: () => deleteBanner(id),
      successMsg: "Deleted",
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((b) => b.id === id ? { ...b, isPublished: !current } : b),
      serverAction: () => toggleBannerPublish(id, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  const handleSaveLabel = (id: string) => {
    execute({
      optimisticUpdate: (prev) => prev.map((b) => b.id === id ? { ...b, label: editLabelValue } : b),
      serverAction: () => updateBannerLabel(id, editLabelValue),
      successMsg: "Label updated",
    });
    setEditingLabelId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-muted-foreground text-sm">Manage up to {MAX_BANNERS} banner images ({banners.length}/{MAX_BANNERS} used)</p>
        </div>
        <button onClick={() => { resetForm(); setIsAdding(true); }}
          disabled={!canAddMore}
          className={"px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 " +
            (canAddMore ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed")}>
          <Upload className="w-4 h-4" />
          {canAddMore ? "Upload Banner" : `Max ${MAX_BANNERS} Reached`}
        </button>
      </div>

      {/* Upload / Replace Modal */}
      {(isAdding || replacingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && !isBusy && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{replacingId ? "Replace Banner" : "Upload New Banner"}</h2>
              <button type="button" onClick={() => !isBusy && resetForm()}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* File Picker */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Banner Image (4:3 recommended) *</label>
                <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                  {uploadedUrl ? (
                    <div className="space-y-3">
                      <div className="aspect-[4/3] max-h-48 mx-auto rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <img src={uploadedUrl} alt="Uploaded" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-sm font-bold">
                        <Check className="w-4 h-4" /> Uploaded to Cloudinary
                      </div>
                    </div>
                  ) : preview ? (
                    <div className="space-y-3">
                      <div className="aspect-[4/3] max-h-48 mx-auto rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                      <p className="text-xs text-muted-foreground">Local preview — not uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to select a banner image</p>
                    </div>
                  )}
                  {step === "select" && (
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
                      className="mt-3 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                  )}
                </div>
              </div>

              {/* Label Input — only for new banners */}
              {!replacingId && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Label <span className="font-normal">({label.length}/10 chars)</span>
                  </label>
                  <input type="text" value={label} maxLength={10}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Day 1"
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
              )}

              {/* Status */}
              {statusMsg && (
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {statusMsg}
                </div>
              )}

              {/* Confirmed URL */}
              {uploadedUrl && step === "uploaded" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 break-all">
                  ✅ {uploadedUrl}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={() => !isBusy && resetForm()} disabled={isBusy}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl disabled:opacity-50">Cancel</button>
                {step === "select" && (
                  <button type="button" onClick={handleUploadToCloudinary}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700">
                    <CloudUpload className="w-4 h-4" /> Upload to Cloud
                  </button>
                )}
                {step === "uploading" && (
                  <button disabled className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl opacity-50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </button>
                )}
                {step === "uploaded" && (
                  <button type="button" onClick={handleSaveToDB}
                    className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700">
                    <Check className="w-4 h-4" /> Save Banner
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

      {/* Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            No banners yet. Click &quot;Upload Banner&quot; to add your first (max 3).
          </p>
        )}
        {banners.map((b) => (
          <div key={b.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-800 relative">
              {b.url && <img src={b.url} alt="Banner" className="w-full h-full object-contain" />}
              {b.label && (
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                  {b.label}
                </div>
              )}
            </div>
            <div className="p-3 space-y-2">
              {/* Label Edit */}
              <div className="flex items-center gap-2">
                {editingLabelId === b.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input type="text" value={editLabelValue} maxLength={10}
                      onChange={(e) => setEditLabelValue(e.target.value)}
                      className="flex-1 bg-background border rounded px-2 py-1 text-sm"
                      autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveLabel(b.id)} />
                    <button onClick={() => handleSaveLabel(b.id)} className="text-xs text-emerald-600 font-bold">Save</button>
                    <button onClick={() => setEditingLabelId(null)} className="text-xs text-muted-foreground">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-muted-foreground">{b.label || "No label"}</span>
                    <button onClick={() => { setEditingLabelId(b.id); setEditLabelValue(b.label || ""); }}
                      className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                  </div>
                )}
                <button onClick={() => handleTogglePublish(b.id, !!b.isPublished)} disabled={isPending}
                  className={"px-2 py-0.5 rounded-full text-[10px] font-bold border disabled:opacity-50 " +
                    (b.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200")}>
                  {b.isPublished ? "PUBLISHED" : "DRAFT"}
                </button>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { resetForm(); setReplacingId(b.id); }} disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg disabled:opacity-50 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Replace
                </button>
                <button onClick={() => handleDelete(b.id)} disabled={isPending}
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

"use client";
import { errorMessage } from "@/lib/utils";

import { useState, useRef } from "react";
import { CloudUpload, Trash2, Loader2, X, Check, ImageIcon, RefreshCw } from "lucide-react";
import { addHeroImage, deleteHeroImage, getHeroImages } from "./actions";
import type { HeroImageRow } from "@/db/schema";

import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET as UPLOAD_PRESET } from "@/lib/cloudinary-config";

export function StoryClient({ initialHeroImages }: { initialHeroImages: HeroImageRow[] }) {
  const [images, setImages] = useState<HeroImageRow[]>(initialHeroImages);
  const [showUpload, setShowUpload] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // Upload state
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "uploading" | "uploaded" | "saving">("select");
  const [statusMsg, setStatusMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isBusy = step === "uploading" || step === "saving";

  const resetForm = () => {
    setShowUpload(false);
    setReplacingId(null);
    setPreview(null);
    setSelectedFile(null);
    setUploadedUrl(null);
    setUploadedPublicId(null);
    setStep("select");
    setStatusMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadToCloudinary = async () => {
    if (!selectedFile) return;
    setStep("uploading");
    setStatusMsg("Uploading to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "victory-youth/hero");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
      setUploadedUrl(data.secure_url);
      setUploadedPublicId(data.public_id);
      setStep("uploaded");
      setStatusMsg("");
    } catch (err) {
      setStep("select");
      setStatusMsg("");
      alert("Upload error: " + errorMessage(err));
    }
  };

  const handleSaveToDB = async () => {
    if (!uploadedUrl || !uploadedPublicId) return;
    setStep("saving");
    setStatusMsg("Saving...");
    try {
      // If replacing, delete old first then add new
      if (replacingId) {
        await deleteHeroImage(replacingId);
      }
      const result = await addHeroImage(uploadedUrl, uploadedPublicId);
      if (!result.success) throw new Error(result.error || "Failed to save");
      const updated = await getHeroImages();
      setImages(updated);
      resetForm();
    } catch (err) {
      setStep("uploaded");
      setStatusMsg("");
      alert("Save error: " + errorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hero image?")) return;
    setIsPending(true);
    try {
      const result = await deleteHeroImage(id);
      if (!result.success) throw new Error(result.error || "Failed to delete");
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      alert("Delete error: " + errorMessage(err));
    }
    setIsPending(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Story</h1>
          <p className="text-muted-foreground text-sm">
            Manage hero images for the homepage carousel (max 5). Auto-scrolls every 3 seconds.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowUpload(true); }}
          disabled={images.length >= 5}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          <CloudUpload className="w-4 h-4" />
          Upload Image ({images.length}/5)
        </button>
      </div>

      {/* Upload Modal */}
      {(showUpload || replacingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && !isBusy && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {replacingId ? "Replace Image" : "Upload Hero Image"}
              </h2>
              <button type="button" onClick={() => !isBusy && resetForm()}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Image</label>
                <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                  {uploadedUrl ? (
                    <div className="space-y-3">
                      <img src={uploadedUrl} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" />
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-sm font-bold">
                        <Check className="w-4 h-4" /> Uploaded to Cloudinary
                      </div>
                    </div>
                  ) : preview ? (
                    <div className="space-y-3">
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <p className="text-xs text-muted-foreground">Local preview — not uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                      <p className="text-sm text-muted-foreground">Select a hero image</p>
                    </div>
                  )}
                  {step === "select" && (
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
                      className="mt-3 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                  )}
                </div>
              </div>

              {statusMsg && (
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {statusMsg}
                </div>
              )}

              {uploadedUrl && step === "uploaded" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 break-all">
                  ✅ {uploadedUrl}
                </div>
              )}

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
                    <Check className="w-4 h-4" /> {replacingId ? "Replace" : "Save Image"}
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

      {/* Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            No hero images yet. Click &quot;Upload Image&quot; to add your first (max 5).
          </p>
        )}
        {images.map((img, i) => (
          <div key={img.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-800 relative">
              <img src={img.url} alt={`Hero ${i + 1}`} className="w-full h-full object-contain" />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                #{i + 1}
              </div>
            </div>
            <div className="p-3">
              <div className="flex gap-2">
                <button onClick={() => { resetForm(); setReplacingId(img.id); }} disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg disabled:opacity-50 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Replace
                </button>
                <button onClick={() => handleDelete(img.id)} disabled={isPending}
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

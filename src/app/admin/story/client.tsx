"use client";

import { useState, useRef } from "react";
import { CloudUpload, Trash2, Loader2, X, Check, ImageIcon, RefreshCw } from "lucide-react";
import {
  getStoryImage, saveStoryImage, deleteStoryImage,
  getHeroImages, addHeroImage, deleteHeroImage
} from "./actions";
import type { HeroImageRow } from "@/db/schema";

const CLOUD_NAME = "y5dnsgyb";
const UPLOAD_PRESET = "victory_youth_unsigned";

interface StoryData {
  url: string | null;
  publicId: string | null;
  alt: string;
}

export function StoryClient({
  initialStory,
  initialHeroImages,
}: {
  initialStory: StoryData;
  initialHeroImages: HeroImageRow[];
}) {
  // ── Legacy single story image (fallback) ──
  const [story, setStory] = useState<StoryData>(initialStory);

  // ── Hero images carousel ──
  const [heroImages, setHeroImages] = useState<HeroImageRow[]>(initialHeroImages);

  // ── Upload state ──
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"story" | "hero">("hero");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "uploading" | "uploaded" | "saving">("select");
  const [statusMsg, setStatusMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const isBusy = step === "uploading" || step === "saving";

  const resetForm = () => {
    setShowUpload(false);
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
    } catch (err: any) {
      setStep("select");
      setStatusMsg("");
      alert("Upload error: " + err.message);
    }
  };

  const handleSaveHeroImage = async () => {
    if (!uploadedUrl || !uploadedPublicId) return;
    setStep("saving");
    setStatusMsg("Saving...");
    try {
      const result = await addHeroImage(uploadedUrl, uploadedPublicId);
      if (!result.success) throw new Error(result.error || "Failed to save");
      // Refresh list
      const updated = await getHeroImages();
      setHeroImages(updated);
      resetForm();
    } catch (err: any) {
      setStep("uploaded");
      setStatusMsg("");
      alert("Save error: " + err.message);
    }
  };

  const handleSaveStory = async () => {
    if (!uploadedUrl || !uploadedPublicId) return;
    setStep("saving");
    setStatusMsg("Saving...");
    try {
      const result = await saveStoryImage(uploadedUrl, uploadedPublicId);
      if (!result.success) throw new Error(result.error || "Failed to save");
      setStory({ url: uploadedUrl, publicId: uploadedPublicId, alt: "Victory Youth Association" });
      resetForm();
    } catch (err: any) {
      setStep("uploaded");
      setStatusMsg("");
      alert("Save error: " + err.message);
    }
  };

  const handleDeleteHeroImage = async (id: string) => {
    if (!confirm("Delete this hero image?")) return;
    setIsDeleting(id);
    try {
      const result = await deleteHeroImage(id);
      if (!result.success) throw new Error(result.error || "Failed to delete");
      setHeroImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err: any) {
      alert("Delete error: " + err.message);
    }
    setIsDeleting(null);
  };

  const handleDeleteStory = async () => {
    if (!confirm("Delete the fallback Story image? The homepage will show default banner.")) return;
    setIsDeleting("story");
    try {
      const result = await deleteStoryImage();
      if (!result.success) throw new Error(result.error || "Failed to delete");
      setStory({ url: null, publicId: null, alt: "Victory Youth Association" });
    } catch (err: any) {
      alert("Delete error: " + err.message);
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-8">

      {/* ═══ Hero Carousel Images ═══ */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Hero Carousel</h1>
            <p className="text-muted-foreground text-sm">Manage up to 5 hero images. They auto-scroll on the homepage every 3 seconds.</p>
          </div>
          <button
            onClick={() => { resetForm(); setUploadTarget("hero"); setShowUpload(true); }}
            disabled={heroImages.length >= 5}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            Add Image ({heroImages.length}/5)
          </button>
        </div>

        {heroImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {heroImages.map((img, i) => (
              <div key={img.id} className="relative bg-card border rounded-xl overflow-hidden shadow-sm group">
                <img src={img.url} alt={`Hero ${i + 1}`} className="w-full aspect-video object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                  #{i + 1}
                </div>
                <button
                  onClick={() => handleDeleteHeroImage(img.id)}
                  disabled={isDeleting === img.id}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {isDeleting === img.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border rounded-2xl flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="w-14 h-14 mb-3 opacity-30" />
            <p className="text-lg font-bold">No Hero Images</p>
            <p className="text-sm">Add images to create the homepage carousel</p>
          </div>
        )}
      </div>

      {/* ═══ Fallback Story Image (legacy) ═══ */}
      <div className="border-t pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold">Fallback Story Image</h2>
            <p className="text-muted-foreground text-sm">Shown when no carousel images exist. Stays active permanently.</p>
          </div>
          <div className="flex items-center gap-2">
            {story.url && (
              <button onClick={handleDeleteStory} disabled={isDeleting === "story"}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-1.5 disabled:opacity-50">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
            <button onClick={() => { resetForm(); setUploadTarget("story"); setShowUpload(true); }}
              className="px-3 py-1.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-1.5">
              {story.url ? <RefreshCw className="w-3 h-3" /> : <CloudUpload className="w-3 h-3" />}
              {story.url ? "Replace" : "Upload"}
            </button>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          {story.url ? (
            <img src={story.url} alt={story.alt} className="w-full h-auto max-h-48 object-cover" />
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              No fallback image set — will show /hero-banner.jpg
            </div>
          )}
        </div>
      </div>

      {/* ═══ Upload Modal ═══ */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && !isBusy && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {uploadTarget === "hero" ? "Add Hero Image" : "Upload Fallback Image"}
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
                      <p className="text-sm text-muted-foreground">Select an image</p>
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
                  <button type="button" onClick={uploadTarget === "hero" ? handleSaveHeroImage : handleSaveStory}
                    className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700">
                    <Check className="w-4 h-4" /> {uploadTarget === "hero" ? "Add to Carousel" : "Save as Fallback"}
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
    </div>
  );
}

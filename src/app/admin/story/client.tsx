"use client";

import { useState, useRef } from "react";
import { Trash2, X, Image as ImageIcon, Loader2, RefreshCw, Check, CloudUpload } from "lucide-react";
import { saveStoryImage, deleteStoryImage } from "./actions";

const CLOUD_NAME = "y5dnsgyb";
const UPLOAD_PRESET = "victory_youth_unsigned";

interface StoryData {
  url: string | null;
  publicId: string | null;
  alt: string;
}

export function StoryClient({ story: initialStory }: { story: StoryData }) {
  const [story, setStory] = useState(initialStory);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [step, setStep] = useState<"select" | "uploading" | "uploaded" | "saving">("select");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isBusy = step === "uploading" || step === "saving";

  const resetForm = () => {
    setShowUpload(false); setPreview(null);
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
    } catch (err: any) {
      setStep("select"); setStatusMsg("");
      alert("Upload error: " + err.message);
    }
  };

  const handleSave = async () => {
    if (!uploadedUrl || !uploadedPublicId) return;
    setStep("saving"); setStatusMsg("Saving...");
    try {
      const result = await saveStoryImage(uploadedUrl, uploadedPublicId);
      if (!result.success) throw new Error(result.error || "Failed to save");
      setStory({ url: uploadedUrl, publicId: uploadedPublicId, alt: "Victory Youth Association" });
      resetForm();
    } catch (err: any) {
      setStep("uploaded"); setStatusMsg("");
      alert("Save error: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete the Story image? The frontend will show the default banner.")) return;
    setIsUploading(true);
    try {
      const result = await deleteStoryImage();
      if (!result.success) throw new Error(result.error || "Failed to delete");
      setStory({ url: null, publicId: null, alt: "Victory Youth Association" });
    } catch (err: any) {
      alert("Delete error: " + err.message);
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Story</h1>
          <p className="text-muted-foreground text-sm">Manage the main hero image on the homepage. Stays active permanently until you change it.</p>
        </div>
        <div className="flex items-center gap-2">
          {story.url && (
            <button onClick={handleDelete} disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-2 disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <button onClick={() => { resetForm(); setShowUpload(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            {story.url ? <RefreshCw className="w-4 h-4" /> : <CloudUpload className="w-4 h-4" />}
            {story.url ? "Replace Image" : "Upload Image"}
          </button>
        </div>
      </div>

      {/* Current Story Image */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {story.url ? (
          <div className="bg-stone-50 dark:bg-stone-900">
            <img src={story.url} alt={story.alt} className="w-full h-auto" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-bold">No Story Image Set</p>
            <p className="text-sm">The homepage will show the default banner (/hero-banner.jpg)</p>
          </div>
        )}
        {story.url && (
          <div className="px-4 py-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground break-all">URL: {story.url}</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: any) => e.target === e.currentTarget && !isBusy && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{story.url ? "Replace Story Image" : "Upload Story Image"}</h2>
              <button type="button" onClick={() => !isBusy && resetForm()}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Image (any aspect ratio — displayed as-is, no cropping)</label>
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
                      <p className="text-sm text-muted-foreground">Select the hero image for the homepage</p>
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
                  <button type="button" onClick={handleSave}
                    className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700">
                    <Check className="w-4 h-4" /> Save as Story
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

"use client";

import { useState } from "react";
import { Plus, Bell, Trash2, Edit, Eye, EyeOff, X } from "lucide-react";
import {
  addNotice, updateNotice, deleteNotice,
  toggleNoticePublish, setAllNoticesVisibility,
} from "./actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";

type Notice = {
  id: string;
  title: string;
  body: string;
  status: string | null;
  createdAt: Date | null;
};

export default function NoticesClient({ initialData }: { initialData: Notice[] }) {
  const { data, isPending, execute } = useAdminAction<Notice>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (n) => [n.title, n.body, n.status]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const isAllPublished = data.length > 0 && data.every((n) => n.status === "PUBLISHED");

  const resetForm = () => {
    setShowForm(false); setEditingId(null); setTitle(""); setBody("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (editingId) {
      execute({
        optimisticUpdate: (prev) => prev.map((n) => n.id === editingId ? { ...n, title, body } : n),
        serverAction: () => updateNotice(editingId, { title, body }),
        successMsg: "Notice updated",
        onSuccess: resetForm,
      });
    } else {
      execute({
        serverAction: () => addNotice({ title, body }),
        successMsg: "Notice added",
        onSuccess: resetForm,
      });
    }
  };

  const handleToggle = (id: string, currentlyPublished: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((n) =>
        n.id === id ? { ...n, status: currentlyPublished ? "DRAFT" : "PUBLISHED" } : n
      ),
      serverAction: () => toggleNoticePublish(id, !currentlyPublished),
      successMsg: currentlyPublished ? "Notice unpublished" : "Notice published",
    });
  };

  const handleDelete = (id: string) => {
    execute({
      optimisticUpdate: (prev) => prev.filter((n) => n.id !== id),
      serverAction: () => deleteNotice(id),
      successMsg: "Notice deleted",
    });
  };

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((n) => ({ ...n, status: newState ? "PUBLISHED" : "DRAFT" })),
      serverAction: () => setAllNoticesVisibility(newState),
      successMsg: newState ? "All notices published" : "All notices unpublished",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="w-6 h-6" /> Notices</h1>
          <p className="text-muted-foreground text-sm">Announcements & public notices</p>
        </div>
        <div className="flex items-center gap-3">
          {data.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <div className="w-px h-6 bg-border" />
          <button onClick={() => { setShowForm(true); setEditingId(null); setTitle(""); setBody(""); }}
            disabled={isPending}
            className={"px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 transition-all " +
              (isPending ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:opacity-90")}>
            <Plus className="w-4 h-4" /> Add Notice
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editingId ? "Edit Notice" : "New Notice"}</h3>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title *" required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notice body *" required rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
              {isPending ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search notices by title or text…" shown={visible.length} total={data.length} />

      <div className="space-y-3">
        {search && visible.length === 0 && data.length > 0 && <p className="text-center text-muted-foreground py-8 text-sm">No matches for &ldquo;{search}&rdquo;.</p>}
        {data.length === 0 && <p className="text-center text-muted-foreground py-12">No notices yet. Click &quot;Add Notice&quot; to create one.</p>}
        {visible.map((n) => {
          const isPublished = n.status === "PUBLISHED";
          return (
            <div key={n.id}
              className={`p-4 rounded-xl border flex items-start justify-between transition-all ${isPublished ? "bg-card border-emerald-200 dark:border-emerald-800" : "bg-muted/30 border-border"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-teal-500" />
                  {isPublished
                    ? <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">Published</span>
                    : <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 text-xs">Draft</span>}
                </div>
                <h3 className="font-bold text-foreground">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => handleToggle(n.id, isPublished)} disabled={isPending}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border disabled:opacity-50 ${isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>
                  {isPublished ? "PUBLISHED" : "DRAFT"}
                </button>
                <button onClick={() => { setTitle(n.title); setBody(n.body); setEditingId(n.id); setShowForm(true); }}
                  disabled={isPending} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50">
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button onClick={() => handleDelete(n.id)} disabled={isPending}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

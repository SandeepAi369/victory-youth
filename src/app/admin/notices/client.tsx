"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Bell, StickyNote, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import {
  addNotice, updateNotice, deleteNotice, toggleNoticePublish, setAllNoticesVisibility,
  addNote, updateNote, deleteNote, toggleNotePublish, setAllNotesVisibility,
} from "./actions";
import { toast } from "sonner";

export default function NoticesClient({
  initialNotices,
  initialNotes,
}: {
  initialNotices: any[];
  initialNotes: any[];
}) {
  const router = useRouter();
  const [notices, setNotices] = useState(initialNotices);
  const [notes, setNotes] = useState(initialNotes);
  const [tab, setTab] = useState<"notices" | "notes">("notices");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [author, setAuthor] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sync with server re-renders
  useEffect(() => { setNotices(initialNotices); }, [initialNotices]);
  useEffect(() => { setNotes(initialNotes); }, [initialNotes]);

  // YouTube-style top loading bar
  useEffect(() => {
    if (isPending) {
      window.dispatchEvent(new Event("admin-loading-start"));
    } else {
      window.dispatchEvent(new Event("admin-loading-end"));
    }
  }, [isPending]);

  const isAllNoticesPublished = notices.length > 0 && notices.every((n: any) => n.status === "PUBLISHED");
  const isAllNotesPublished = notes.length > 0 && notes.every((n: any) => n.isPublished);

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setTitle(""); setBody(""); setCategory("general"); setAuthor("");
  };

  /** Helper: execute with optimistic update + background server call */
  const run = (opts: {
    optimisticUpdate?: () => void;
    serverAction: () => Promise<{ success: boolean; error?: string } | undefined>;
    successMsg?: string;
    onSuccess?: () => void;
  }) => {
    if (opts.optimisticUpdate) opts.optimisticUpdate();
    startTransition(async () => {
      try {
        const r = await opts.serverAction();
        if (r?.success) {
          if (opts.successMsg) toast.success(opts.successMsg);
          if (opts.onSuccess) opts.onSuccess();
          router.refresh();
        } else {
          toast.error(r?.error || "Operation failed");
          router.refresh(); // revert
        }
      } catch (err: any) {
        toast.error(err?.message || "Network error");
        router.refresh();
      }
    });
  };

  // ── MASTER TOGGLES ──
  const handleNoticesMasterToggle = () => {
    const newState = !isAllNoticesPublished;
    run({
      optimisticUpdate: () => setNotices((prev: any[]) => prev.map((n) => ({ ...n, status: newState ? "PUBLISHED" : "DRAFT" }))),
      serverAction: () => setAllNoticesVisibility(newState),
      successMsg: newState ? "All notices published" : "All notices unpublished",
    });
  };

  const handleNotesMasterToggle = () => {
    const newState = !isAllNotesPublished;
    run({
      optimisticUpdate: () => setNotes((prev: any[]) => prev.map((n) => ({ ...n, isPublished: newState }))),
      serverAction: () => setAllNotesVisibility(newState),
      successMsg: newState ? "All notes published" : "All notes unpublished",
    });
  };

  // ── SUBMIT ──
  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    run({
      serverAction: () => editingId ? updateNotice(editingId, { title, body }) : addNotice({ title, body }),
      successMsg: editingId ? "Updated" : "Notice added",
      onSuccess: resetForm,
    });
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    run({
      serverAction: () => editingId
        ? updateNote(editingId, { title, content: body, category })
        : addNote({ title, content: body, category, authorName: author || "Admin" }),
      successMsg: editingId ? "Updated" : "Note added",
      onSuccess: resetForm,
    });
  };

  // ── DELETE ──
  const handleDelete = (type: "notice" | "note", id: string) => {
    if (!confirm("Delete this item?")) return;
    run({
      optimisticUpdate: () => {
        if (type === "notice") setNotices((prev: any[]) => prev.filter((n) => n.id !== id));
        else setNotes((prev: any[]) => prev.filter((n) => n.id !== id));
      },
      serverAction: () => type === "notice" ? deleteNotice(id) : deleteNote(id),
      successMsg: "Deleted",
    });
  };

  // ── TOGGLE INDIVIDUAL ──
  const handleToggle = (type: "notice" | "note", id: string, current: boolean) => {
    run({
      optimisticUpdate: () => {
        if (type === "notice") {
          setNotices((prev: any[]) => prev.map((n) => n.id === id ? { ...n, status: current ? "DRAFT" : "PUBLISHED" } : n));
        } else {
          setNotes((prev: any[]) => prev.map((n) => n.id === id ? { ...n, isPublished: !current } : n));
        }
      },
      serverAction: () => type === "notice" ? toggleNoticePublish(id, !current) : toggleNotePublish(id, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notices & Notes</h1>
          <p className="text-sm text-muted-foreground">Announcements and committee updates — publish to frontend</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {tab === "notices" && notices.length > 0 && (
            <button onClick={handleNoticesMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all disabled:opacity-50 " +
                (isAllNoticesPublished
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllNoticesPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllNoticesPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          {tab === "notes" && notes.length > 0 && (
            <button onClick={handleNotesMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all disabled:opacity-50 " +
                (isAllNotesPublished
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllNotesPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllNotesPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { resetForm(); setShowForm(true); }} disabled={isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add {tab === "notices" ? "Notice" : "Note"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => { setTab("notices"); resetForm(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "notices" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Bell className="w-4 h-4 inline mr-1.5" />Notices ({notices.length})
        </button>
        <button onClick={() => { setTab("notes"); resetForm(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <StickyNote className="w-4 h-4 inline mr-1.5" />Notes ({notes.length})
        </button>
      </div>

      {showForm && (
        <form onSubmit={tab === "notices" ? handleSubmitNotice : handleSubmitNote}
          className="p-5 rounded-xl bg-card border border-border space-y-4">
          <h3 className="font-bold">{editingId ? "Edit" : "New"} {tab === "notices" ? "Notice" : "Note"}</h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)}
            placeholder={tab === "notices" ? "Notice body *" : "Note content *"} required rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          {tab === "notes" && (
            <div className="flex gap-3">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="general">General</option>
                <option value="financial">Financial</option>
                <option value="event">Event</option>
                <option value="committee">Committee</option>
              </select>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author"
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
              {isPending ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {tab === "notices" && (
        <div className="space-y-3">
          {notices.length === 0 && <p className="text-center text-muted-foreground py-8">No notices yet.</p>}
          {notices.map((n: any) => {
            const isPublished = n.status === "PUBLISHED";
            return (
              <div key={n.id}
                className={`p-4 rounded-xl border flex items-start justify-between ${isPublished ? "bg-card border-emerald-200 dark:border-emerald-800" : "bg-muted/30 border-border"}`}>
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
                  <button onClick={() => handleToggle("notice", n.id, isPublished)} disabled={isPending}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border disabled:opacity-50 ${isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>
                    {isPublished ? "PUBLISHED" : "DRAFT"}
                  </button>
                  <button onClick={() => { setTitle(n.title); setBody(n.body); setEditingId(n.id); setShowForm(true); }}
                    disabled={isPending} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete("notice", n.id)} disabled={isPending}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-3">
          {notes.length === 0 && <p className="text-center text-muted-foreground py-8">No notes yet.</p>}
          {notes.map((note: any) => (
            <div key={note.id}
              className={`p-4 rounded-xl border flex items-start justify-between ${note.isPublished ? "bg-card border-emerald-200 dark:border-emerald-800" : "bg-muted/30 border-border"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{note.category}</span>
                  {note.isPublished
                    ? <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">Published</span>
                    : <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 text-xs">Draft</span>}
                </div>
                <h3 className="font-bold text-foreground">{note.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof note.content === "string" ? note.content : JSON.stringify(note.content)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">— {note.authorName}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => handleToggle("note", note.id, !!note.isPublished)} disabled={isPending}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border disabled:opacity-50 ${note.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>
                  {note.isPublished ? "PUBLISHED" : "DRAFT"}
                </button>
                <button onClick={() => { setTitle(note.title); setBody(typeof note.content === "string" ? note.content : "");
                    setCategory(note.category || "general"); setEditingId(note.id); setTab("notes"); setShowForm(true); }}
                  disabled={isPending} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50">
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button onClick={() => handleDelete("note", note.id)} disabled={isPending}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import { Plus, Eye, EyeOff, Edit, Trash2, Bell, StickyNote } from "lucide-react";
import { addNotice, updateNotice, deleteNotice, toggleNoticePublish, addNote, updateNote, deleteNote, toggleNotePublish } from "./actions";
import { toast } from "sonner";

type Notice = { id: string; title: string; body: string; status: string | null; createdAt: Date | null };
type Note = { id: string; title: string; content: any; category: string | null; authorName: string; isPinned: boolean | null; isPublished: boolean | null; createdAt: Date | null };

export default function NoticesClient({ initialNotices, initialNotes }: { initialNotices: Notice[]; initialNotes: Note[] }) {
  const [tab, setTab] = useState<"notices" | "notes">("notices");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [author, setAuthor] = useState("Admin");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const resetForm = () => { setTitle(""); setBody(""); setCategory("general"); setEditingId(null); setShowForm(false); };

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    startTransition(async () => {
      if (editingId) {
        await updateNotice(editingId, { title, body });
        toast.success("Notice updated");
      } else {
        await addNotice({ title, body });
        toast.success("Notice added");
      }
      resetForm(); router.refresh(); 
    });
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    startTransition(async () => {
      if (editingId) {
        await updateNote(editingId, { title, content: body, category });
        toast.success("Note updated");
      } else {
        await addNote({ title, content: body, category, authorName: author });
        toast.success("Note added");
      }
      resetForm(); router.refresh(); 
    });
  };

  const handleDelete = (type: "notice" | "note", id: string) => {
    if (!confirm("Delete this entry?")) return;
    startTransition(async () => {
      type === "notice" ? await deleteNotice(id) : await deleteNote(id);
      toast.success("Deleted"); router.refresh(); });
  };

  const handleToggle = (type: "notice" | "note", id: string, current: boolean) => {
    startTransition(async () => {
      type === "notice" ? await toggleNoticePublish(id, !current) : await toggleNotePublish(id, !current);
      toast.success(current ? "Unpublished" : "Published"); router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Notices & Notes</h1><p className="text-sm text-muted-foreground">Announcements and committee updates — publish to frontend</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add {tab === "notices" ? "Notice" : "Note"}</button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => { setTab("notices"); resetForm(); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "notices" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Bell className="w-4 h-4 inline mr-1.5" />Notices ({initialNotices.length})
        </button>
        <button onClick={() => { setTab("notes"); resetForm(); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <StickyNote className="w-4 h-4 inline mr-1.5" />Notes ({initialNotes.length})
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={tab === "notices" ? handleSubmitNotice : handleSubmitNote} className="p-5 rounded-xl bg-card border border-border space-y-4">
          <h3 className="font-bold">{editingId ? "Edit" : "New"} {tab === "notices" ? "Notice" : "Note"}</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title *" required className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={tab === "notices" ? "Notice body *" : "Note content *"} required rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          {tab === "notes" && (
            <div className="flex gap-3">
              <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="general">General</option><option value="financial">Financial</option><option value="event">Event</option><option value="committee">Committee</option>
              </select>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm">{isPending ? "Saving..." : editingId ? "Update" : "Save"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* NOTICES TAB */}
      {tab === "notices" && (
        <div className="space-y-3">
          {initialNotices.length === 0 && <p className="text-center text-muted-foreground py-8">No notices yet.</p>}
          {initialNotices.map(n => {
            const isPublished = n.status === "PUBLISHED";
            return (
              <div key={n.id} className={`p-4 rounded-xl border flex items-start justify-between ${isPublished ? "bg-card border-emerald-200 dark:border-emerald-800" : "bg-muted/30 border-border"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-teal-500" />
                    {isPublished ? <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">Published</span> : <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 text-xs">Draft</span>}
                  </div>
                  <h3 className="font-bold text-foreground">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => handleToggle("notice", n.id, isPublished)} disabled={isPending} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border ${isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>{isPublished ? "PUBLISHED" : "DRAFT"}</button>
                  <button onClick={() => { setTitle(n.title); setBody(n.body); setEditingId(n.id); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"><Edit className="w-4 h-4 text-blue-600" /></button>
                  <button onClick={() => handleDelete("notice", n.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NOTES TAB */}
      {tab === "notes" && (
        <div className="space-y-3">
          {initialNotes.length === 0 && <p className="text-center text-muted-foreground py-8">No notes yet.</p>}
          {initialNotes.map(note => (
            <div key={note.id} className={`p-4 rounded-xl border flex items-start justify-between ${note.isPublished ? "bg-card border-emerald-200 dark:border-emerald-800" : "bg-muted/30 border-border"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{note.category}</span>
                  {note.isPublished ? <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">Published</span> : <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 text-xs">Draft</span>}
                </div>
                <h3 className="font-bold text-foreground">{note.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{typeof note.content === "string" ? note.content : JSON.stringify(note.content)}</p>
                <p className="text-xs text-muted-foreground mt-2">— {note.authorName}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => handleToggle("note", note.id, !!note.isPublished)} disabled={isPending} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border ${note.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>{note.isPublished ? "PUBLISHED" : "DRAFT"}</button>
                <button onClick={() => { setTitle(note.title); setBody(typeof note.content === "string" ? note.content : ""); setCategory(note.category || "general"); setEditingId(note.id); setTab("notes"); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"><Edit className="w-4 h-4 text-blue-600" /></button>
                <button onClick={() => handleDelete("note", note.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4 text-red-600" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

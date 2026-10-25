"use client";

import { useState } from "react";
import { Plus, StickyNote, Trash2, Edit, Eye, EyeOff, X } from "lucide-react";
import {
  addNote, updateNote, deleteNote,
  toggleNotePublish, setAllNotesVisibility,
} from "../notices/actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";

type Note = {
  id: string;
  title: string;
  content: unknown;
  category: string | null;
  authorName: string;
  isPublished: boolean | null;
  createdAt: Date | null;
};

export default function NotesClient({ initialData }: { initialData: Note[] }) {
  const { data, isPending, execute } = useAdminAction<Note>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (n) => [n.title, n.content, n.category, n.authorName]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [author, setAuthor] = useState("");

  const isAllPublished = data.length > 0 && data.every((n) => n.isPublished);

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setTitle(""); setContent(""); setCategory("general"); setAuthor("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      execute({
        optimisticUpdate: (prev) => prev.map((n) =>
          n.id === editingId ? { ...n, title, content, category, authorName: author || n.authorName } : n
        ),
        serverAction: () => updateNote(editingId, { title, content, category }),
        successMsg: "Note updated",
        onSuccess: resetForm,
      });
    } else {
      execute({
        serverAction: () => addNote({ title, content, category, authorName: author || "Admin" }),
        successMsg: "Note added",
        onSuccess: resetForm,
      });
    }
  };

  const handleToggle = (id: string, currentlyPublished: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((n) =>
        n.id === id ? { ...n, isPublished: !currentlyPublished } : n
      ),
      serverAction: () => toggleNotePublish(id, !currentlyPublished),
      successMsg: currentlyPublished ? "Note unpublished" : "Note published",
    });
  };

  const handleDelete = (id: string) => {
    execute({
      optimisticUpdate: (prev) => prev.filter((n) => n.id !== id),
      serverAction: () => deleteNote(id),
      successMsg: "Note deleted",
    });
  };

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((n) => ({ ...n, isPublished: newState })),
      serverAction: () => setAllNotesVisibility(newState),
      successMsg: newState ? "All notes published" : "All notes unpublished",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><StickyNote className="w-6 h-6" /> Notes</h1>
          <p className="text-muted-foreground text-sm">Important committee notes & updates</p>
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
          <button onClick={() => { setShowForm(true); setEditingId(null); setTitle(""); setContent(""); setCategory("general"); setAuthor(""); }}
            disabled={isPending}
            className={"px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 transition-all " +
              (isPending ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:opacity-90")}>
            <Plus className="w-4 h-4" /> Add Note
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editingId ? "Edit Note" : "New Note"}</h3>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title *" required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Note content *" required rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          <div className="flex gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="general">General</option>
              <option value="financial">Financial</option>
              <option value="event">Event</option>
              <option value="committee">Committee</option>
            </select>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
              {isPending ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search notes by title, text, category or author…" shown={visible.length} total={data.length} />

      <div className="space-y-3">
        {search && visible.length === 0 && data.length > 0 && <p className="text-center text-muted-foreground py-8 text-sm">No matches for &ldquo;{search}&rdquo;.</p>}
        {data.length === 0 && <p className="text-center text-muted-foreground py-12">No notes yet. Click &quot;Add Note&quot; to create one.</p>}
        {visible.map((note) => (
          <div key={note.id}
            className={`p-4 rounded-xl border flex items-start justify-between transition-all ${note.isPublished ? "bg-card border-emerald-200 dark:border-emerald-800" : "bg-muted/30 border-border"}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{note.category || "general"}</span>
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
              <button onClick={() => handleToggle(note.id, !!note.isPublished)} disabled={isPending}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border disabled:opacity-50 ${note.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>
                {note.isPublished ? "PUBLISHED" : "DRAFT"}
              </button>
              <button onClick={() => {
                  setTitle(note.title);
                  setContent(typeof note.content === "string" ? note.content : "");
                  setCategory(note.category || "general");
                  setAuthor(note.authorName || "");
                  setEditingId(note.id); setShowForm(true);
                }}
                disabled={isPending} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50">
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button onClick={() => handleDelete(note.id)} disabled={isPending}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

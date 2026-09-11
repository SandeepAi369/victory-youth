"use client";

import { useRouter } from "next/navigation";

import { useState, useTransition, useEffect } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Users, Clock, MapPin, Image as ImageIcon, X } from "lucide-react";
import { addEvent, updateEvent, togglePublishEvent, deleteEvent, bulkPublishEvents } from "./actions";
import { toast } from "sonner";

export function EventsClient({ events: initialEvents }: { events: any[] }) {
  // Sync props to state for optimistic updates
  const [events, setEvents] = useState(initialEvents);
  useEffect(() => { setEvents(initialEvents); }, [initialEvents]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    day: 1, title: "", description: "", date: "", timing: "", location: "Gudem Gally Mandapam", inCharge: "", imageUrl: "", isPublished: true,
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? events.map((evt) => evt.id) : []);
  };
  const handleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleBulkPublish = (publish: boolean) => {
    startTransition(async () => {
      await bulkPublishEvents(selectedIds, publish);
      setSelectedIds([]); router.refresh(); });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = editingId ? await updateEvent(editingId, formData) : await addEvent(formData);
      if (res?.success) {
        toast.success(editingId ? "Event updated" : "Event added");
        setIsAdding(false); setEditingId(null); router.refresh();
      } else {
        toast.error(res?.error || "Operation failed");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    startTransition(async () => { const r = await deleteEvent(id); if (r?.success) { toast.success("Event deleted"); router.refresh(); } else { toast.error(r?.error || "Delete failed"); } });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    // Optimistic update
    setEvents(events.map((ev) => (ev.id === id ? { ...ev, isPublished: !current } : ev)));
    startTransition(async () => { const r = await togglePublishEvent(id, !current); if (r?.success) { toast.success(current ? "Unpublished" : "Published"); router.refresh(); } else { toast.error(r?.error || "Toggle failed"); setEvents(events.map((ev) => (ev.id === id ? { ...ev, isPublished: current } : ev))); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground text-sm">Create, edit, and publish festival events.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setEditingId(null); }} className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e: any) => e.target === e.currentTarget && (() => { setIsAdding(false); setEditingId(null); })()}>
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{editingId ? "Edit Event" : "New Event"}</h2>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Day (1-11)</label><input type="number" min="1" max="11" required value={formData.day} onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="e.g. Maha Aarti" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-1">Description</label><textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2 h-20" placeholder="Details about the event..." /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Timing</label><input type="text" required value={formData.timing} onChange={(e) => setFormData({ ...formData, timing: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="e.g. 06:00 AM - 08:00 AM" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Location</label><input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">In-Charge</label><input type="text" required value={formData.inCharge} onChange={(e) => setFormData({ ...formData, inCharge: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" /></div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save Event"}</button>
            </div>
          </form>
        </div>
        </div>
        )}

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Event Info</th>
                <th className="px-4 py-3">Timing & Location</th>
                <th className="px-4 py-3">In-Charge</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-xs">Day {evt.day}</span></td>
                  <td className="px-4 py-3"><div className="font-bold text-foreground">{evt.title}</div><div className="text-xs text-muted-foreground truncate max-w-[200px]">{evt.description}</div></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.date} • {evt.timing}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {evt.inCharge}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(evt.id, evt.isPublished)} disabled={isPending} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border ${evt.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"}`}>{evt.isPublished ? "PUBLISHED" : "DRAFT"}</button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingId(evt.id); setIsAdding(false); setFormData({ day: evt.day, title: evt.title, description: evt.description, date: evt.date, timing: evt.timing, location: evt.location, inCharge: evt.inCharge, imageUrl: evt.imageUrl || "", isPublished: evt.isPublished }); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(evt.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

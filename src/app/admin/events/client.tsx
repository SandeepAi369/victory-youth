"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, MapPin, X, Eye, EyeOff } from "lucide-react";
import {
  addEvent, updateEvent, togglePublishEvent, deleteEvent,
  setAllEventsVisibility,
} from "./actions";
import type { getEvents } from "./actions";

type Row = Awaited<ReturnType<typeof getEvents>>[number];
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";

export function EventsClient({ events: initialEvents }: { events: Row[] }) {
  const { data: events, isPending, execute } = useAdminAction(initialEvents);
  const [search, setSearch] = useState("");
  const visible = filterRows(events, search, (e) => [e.title, e.description, e.location, e.inCharge, e.date]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const publishedCount = events.filter((e) => e.isPublished).length;
  const isAllPublished = events.length > 0 && publishedCount === events.length;

  const [formData, setFormData] = useState({
    day: 1, title: "", description: "", date: "", timing: "",
    location: "Gudem Gally Mandapam", inCharge: "", imageUrl: "", isPublished: true,
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? events.map((evt) => evt.id) : []);
  };
  const handleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleMasterToggle = () => {
    const newState = !isAllPublished;
    execute({
      optimisticUpdate: (prev) => prev.map((e) => ({ ...e, isPublished: newState })),
      serverAction: () => setAllEventsVisibility(newState),
      successMsg: newState ? "All events published" : "All events unpublished",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({
      serverAction: () => editingId ? updateEvent(editingId, formData) : addEvent(formData),
      successMsg: editingId ? "Event updated" : "Event added",
      onSuccess: () => { setIsAdding(false); setEditingId(null); },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this event?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((e) => e.id !== id),
      serverAction: () => deleteEvent(id),
      successMsg: "Event deleted",
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    execute({
      optimisticUpdate: (prev) => prev.map((ev) => ev.id === id ? { ...ev, isPublished: !current } : ev),
      serverAction: () => togglePublishEvent(id, !current),
      successMsg: current ? "Unpublished" : "Published",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground text-sm">Festival Schedule</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {events.length > 0 && (
            <button onClick={handleMasterToggle} disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : isAllPublished ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")}>
              {isAllPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isAllPublished ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { setIsAdding(true); setEditingId(null); }}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && (() => { setIsAdding(false); setEditingId(null); })()}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Event" : "New Event"}</h2>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Day #</label>
                  <input type="number" required value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                    className="w-full bg-background border rounded-lg px-3 py-2" min={1} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Date</label>
                  <input type="date" value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Title *</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Event title" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Timing</label>
                  <input type="text" value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="w-full bg-background border rounded-lg px-3 py-2" placeholder="7:00 AM" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Location</label>
                  <input type="text" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-background border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">In-Charge</label>
                <input type="text" value={formData.inCharge}
                  onChange={(e) => setFormData({ ...formData, inCharge: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Person responsible" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Image URL</label>
                <input type="url" value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublished" checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="rounded" />
                <label htmlFor="isPublished" className="text-sm font-medium">Publish immediately</label>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">
                  {isPending ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search events by title, place, person or date…" shown={visible.length} total={events.length} />

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" onChange={handleSelectAll}
                    checked={selectedIds.length === events.length && events.length > 0} className="rounded" />
                </th>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {search && visible.length === 0 && events.length > 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</td></tr>}
              {events.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No events yet.</td></tr>
              )}
              {visible.map((evt) => (
                <tr key={evt.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(evt.id)}
                      onChange={() => handleSelect(evt.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold">
                      Day {evt.day}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{evt.title}</p>
                    {evt.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{evt.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    <div className="space-y-0.5">
                      {evt.date && <div>{evt.date}</div>}
                      {evt.timing && <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.timing}</div>}
                      {evt.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(evt.id, !!evt.isPublished)} disabled={isPending}
                      className={"px-2.5 py-1 rounded-full text-[10px] font-bold border disabled:opacity-50 " +
                        (evt.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200")}>
                      {evt.isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => {
                        setEditingId(evt.id); setIsAdding(false);
                        setFormData({ day: evt.day, title: evt.title, description: evt.description || "",
                          date: evt.date || "", timing: evt.timing || "",
                          location: evt.location || "Gudem Gally Mandapam",
                          inCharge: evt.inCharge || "", imageUrl: evt.imageUrl || "",
                          isPublished: evt.isPublished ?? true });
                      }} disabled={isPending}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(evt.id)} disabled={isPending}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

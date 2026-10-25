"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { addMember, updateMember, deleteMember, setAllMembersVisibility } from "./actions";
import { useAdminAction } from "@/lib/hooks/useAdminAction";
import { AdminSearch, filterRows } from "@/components/admin/AdminSearch";

type Member = {
  id: string;
  name: string;
  fullName: string | null;
  phone: string;
  membershipFee: number | null;
  role: string | null;
  committeeRole: string | null;
  isActive: boolean | null;
  memberId: string;
  joinDate?: string | null;
  createdAt?: Date | null;
};

const ROLES = ["Member", "Special Candidate"];
const emptyForm = { name: "", fullName: "", phone: "", membershipFee: "", role: "Member", joinDate: new Date().toISOString().split("T")[0] };

export default function MembersClient({ initialData }: { initialData: Member[] }) {
  const { data, isPending, execute } = useAdminAction<Member>(initialData);
  const [search, setSearch] = useState("");
  const visible = filterRows(data, search, (m) => [m.name, m.fullName, m.memberId, m.phone, m.role]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const published = data.length > 0 && data.some((m) => m.isActive === true);
  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.fullName, fullName: form.fullName, phone: form.phone,
      membershipFee: parseInt(form.membershipFee) || 0, role: form.role,
      joinDate: form.joinDate,
    };
    execute({
      // No optimistic for add/edit — we don't have the server-generated ID yet
      serverAction: () => editingId ? updateMember(editingId, payload) : addMember(payload),
      successMsg: editingId ? "Updated" : "Added",
      onSuccess: resetForm,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this member?")) return;
    execute({
      optimisticUpdate: (prev) => prev.filter((d) => d.id !== id),
      serverAction: () => deleteMember(id),
      successMsg: "Removed",
    });
  };

  const handleEdit = (m: Member) => {
    setEditingId(m.id);
    setShowForm(true);
    setForm({
      name: m.name, fullName: m.fullName || m.name, phone: m.phone,
      membershipFee: String(m.membershipFee || 0),
      role: m.role || m.committeeRole || "Member",
      joinDate: m.joinDate || new Date().toISOString().split("T")[0],
    });
  };

  const handleGlobalToggle = () => {
    const newState = !published;
    execute({
      optimisticUpdate: (prev) => prev.map((m) => ({ ...m, isActive: newState })),
      serverAction: () => setAllMembersVisibility(newState),
      successMsg: newState ? "All members visible on frontend" : "All members hidden from frontend",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Committee Members</h1>
          <p className="text-muted-foreground text-sm">
            Committee Members
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.length > 0 && (
            <button
              onClick={handleGlobalToggle}
              disabled={isPending}
              className={
                "px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all " +
                (isPending
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : published
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200")
              }
            >
              {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {published ? "✓ Published" : "Unpublished"}
            </button>
          )}
          <div className="w-px h-6 bg-border" />
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            disabled={isPending}
            className={"px-4 py-2 font-medium text-sm rounded-xl flex items-center gap-2 transition-all " + (isPending ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:opacity-90")}
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && resetForm()}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Member" : "Add New Member"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Full Name *</label>
                <input type="text" required value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value, name: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Enter full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Phone *</label>
                  <input type="tel" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-background border rounded-lg px-3 py-2" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Contribution (₹) *</label>
                  <input type="number" required value={form.membershipFee}
                    onChange={(e) => setForm({ ...form, membershipFee: e.target.value })}
                    className="w-full bg-background border rounded-lg px-3 py-2" placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-background border rounded-lg px-3 py-2">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Date</label>
                <input type="date" value={form.joinDate} readOnly
                  className="w-full bg-background border rounded-lg px-3 py-2 cursor-not-allowed opacity-70" />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminSearch value={search} onChange={setSearch} placeholder="Search members by name, member ID, phone or role…" shown={visible.length} total={data.length} />

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Contribution</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {search && visible.length === 0 && data.length > 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground text-sm">No matches for &ldquo;{search}&rdquo;.</td></tr>}
              {data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No members yet.</td></tr>
              )}
              {visible.map((m) => (
                <tr key={m.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{m.fullName || m.name}</p>

                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{Math.round(Number(m.membershipFee) || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={"px-2 py-0.5 rounded-lg text-xs font-bold " +
                      ((m.role || m.committeeRole) === "Special Candidate"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400")}>
                      {m.role || m.committeeRole || "Member"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {m.joinDate
                      ? new Date(m.joinDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : m.createdAt
                        ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(m)} disabled={isPending}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} disabled={isPending}
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

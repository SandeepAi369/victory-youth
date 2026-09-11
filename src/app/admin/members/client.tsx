"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { addMember, updateMember, deleteMember, setAllMembersVisibility } from "./actions";
import { toast } from "sonner";

type Member = {
  id: string; name: string; fullName: string | null; phone: string;
  membershipFee: number | null; role: string | null; committeeRole: string | null;
  isActive: boolean | null; memberId: string;
};

const ROLES = ["Member", "Special Candidate"];
const emptyForm = { name: "", fullName: "", phone: "", membershipFee: "", role: "Member" };

export default function MembersClient({ initialData }: { initialData: Member[] }) {
  const [data, setData] = useState<Member[]>(initialData);
  useEffect(() => { setData(initialData); }, [initialData]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Track publish state independently so it doesn't flicker
  const [published, setPublished] = useState(() => initialData.length > 0 && initialData.some(m => m.isActive === true));
  useEffect(() => { setPublished(initialData.length > 0 && initialData.some(m => m.isActive === true)); }, [initialData]);

  const totalContribution = data.reduce((sum, m) => sum + (m.membershipFee || 0), 0);
  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, fullName: form.fullName || form.name, phone: form.phone, membershipFee: parseInt(form.membershipFee) || 0, role: form.role };
    startTransition(async () => {
      const r = editingId ? await updateMember(editingId, payload) : await addMember(payload);
      if (r?.success) { toast.success(editingId ? "Updated" : "Added"); resetForm(); router.refresh(); }
      else { toast.error(r?.error || "Failed"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this member?")) return;
    startTransition(async () => {
      const r = await deleteMember(id);
      if (r?.success) { toast.success("Removed"); router.refresh(); } else { toast.error(r?.error || "Failed"); }
    });
  };

  const handleEdit = (m: Member) => {
    setEditingId(m.id); setShowForm(true);
    setForm({ name: m.name, fullName: m.fullName || m.name, phone: m.phone, membershipFee: String(m.membershipFee || 0), role: m.role || m.committeeRole || "Member" });
  };

  const handleGlobalToggle = () => {
    const newState = !published;
    // Optimistic: flip immediately
    setPublished(newState);
    startTransition(async () => {
      const r = await setAllMembersVisibility(newState);
      if (r?.success) {
        toast.success(newState ? "Members visible on frontend" : "Members hidden from frontend");
        router.refresh();
      } else {
        // Rollback on failure
        setPublished(!newState);
        toast.error(r?.error || "Failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Committee Members</h1>
          <p className="text-muted-foreground text-sm">{data.length} members · Total: ₹{totalContribution.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center gap-3">
          {data.length > 0 && (
            <button
              onClick={handleGlobalToggle}
              disabled={isPending}
              className={"px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 border transition-all disabled:opacity-50 " + (
                published
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
              )}
            >
              {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {published ? "Published" : "Unpublished"}
            </button>
          )}
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e: any) => e.target === e.currentTarget && resetForm()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Member" : "Add New Member"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Full Name *</label>
                <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value, name: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="Enter full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Phone *</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Contribution (₹) *</label>
                  <input type="number" required value={form.membershipFee} onChange={e => setForm({ ...form, membershipFee: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2" placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl">Cancel</button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">{isPending ? "Saving..." : "Save"}</button>
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Contribution</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No members yet. Click "Add Member" to start.</td></tr>
              )}
              {data.map(m => (
                <tr key={m.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{m.fullName || m.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{m.memberId}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{(m.membershipFee || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={"px-2 py-0.5 rounded-lg text-xs font-bold " + (
                      (m.role || m.committeeRole) === "Special Candidate"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                    )}>
                      {m.role || m.committeeRole || "Member"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(m.id)} disabled={isPending} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

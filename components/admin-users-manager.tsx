"use client";

import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/components/auth-provider";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  _count: { orders: number; referredUsers: number };
};

type FormState = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export function AdminUsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const blank = useMemo<FormState>(() => ({ name: "", email: "", password: "", role: UserRole.ADMIN }), []);
  const [form, setForm] = useState<FormState>(blank);
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function saveUser() {
    const response = await fetch(form.id ? `/api/admin/users/${form.id}` : "/api/admin/users", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "User saved." : "Unable to save user."));
    if (response.ok) {
      setForm(blank);
      router.refresh();
    }
  }

  async function deleteUser(id: string) {
    setDeleting(true);
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "User deleted." : "Unable to delete user."));
    if (response.ok) router.refresh();
    setDeleting(false);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900">{form.id ? "Edit user" : "Create user"}</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} type="email" placeholder="Email address" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} type="password" placeholder={form.id ? "New password (optional)" : "Password"} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <select value={form.role} onChange={(e) => setForm((c) => ({ ...c, role: e.target.value as UserRole }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.CUSTOMER}>Customer</option>
          </select>
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => { void saveUser(); }} className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">{form.id ? "Update user" : "Create user"}</button>
          {form.id ? <button type="button" onClick={() => setForm(blank)} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold">Cancel edit</button> : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-slate-500">
            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Orders</th><th className="px-6 py-4">Referrals</th><th className="px-6 py-4">Actions</th></tr>
          </thead>
          <tbody>
            {initialUsers.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-100">
                <td className="px-6 py-4 font-semibold">{entry.name}</td>
                <td className="px-6 py-4">{entry.email}</td>
                <td className="px-6 py-4">{entry.role}</td>
                <td className="px-6 py-4">{entry._count.orders}</td>
                <td className="px-6 py-4">{entry._count.referredUsers}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setForm({ id: entry.id, name: entry.name, email: entry.email, password: "", role: entry.role })} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold">Edit</button>
                    <button
                      type="button"
                      disabled={user?.id === entry.id}
                      onClick={() => setPendingDelete(entry)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete user?"
        description={`This will permanently remove ${pendingDelete?.name ?? "this user"} and related account data.`}
        confirmLabel="Delete user"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void deleteUser(pendingDelete.id);
        }}
      />
    </div>
  );
}

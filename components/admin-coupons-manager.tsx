"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  usageLimit: number | null;
  expiresAt: Date | null;
  isActive: boolean;
  _count: { usage: number };
};

type FormState = {
  id?: string;
  code: string;
  usageLimit: string;
  description: string;
  expiresAt: string;
  isActive: boolean;
};

export function AdminCouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const blank = useMemo<FormState>(() => ({ code: "", usageLimit: "", description: "", expiresAt: "", isActive: true }), []);
  const [form, setForm] = useState<FormState>(blank);
  const [message, setMessage] = useState("");

  async function saveCoupon() {
    const response = await fetch(form.id ? `/api/admin/coupons/${form.id}` : "/api/admin/coupons", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        code: form.code,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        description: form.description,
        expiresAt: form.expiresAt,
        isActive: form.isActive,
      }),
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "Coupon saved." : "Unable to save coupon."));
    if (response.ok) {
      setForm(blank);
      router.refresh();
    }
  }

  async function deleteCoupon(id: string) {
    const response = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", credentials: "same-origin" });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "Coupon deleted." : "Unable to delete coupon."));
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900">{form.id ? "Edit coupon" : "Create coupon"}</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} placeholder="Coupon code" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input value={form.usageLimit} onChange={(e) => setForm((c) => ({ ...c, usageLimit: e.target.value }))} type="number" min="1" placeholder="Usage limit (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <input value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Description (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" />
          <input value={form.expiresAt} onChange={(e) => setForm((c) => ({ ...c, expiresAt: e.target.value }))} type="datetime-local" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} />
            Active coupon
          </label>
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => { void saveCoupon(); }} className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">{form.id ? "Update coupon" : "Create coupon"}</button>
          {form.id ? <button type="button" onClick={() => setForm(blank)} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold">Cancel edit</button> : null}
        </div>
      </div>
      <div className="space-y-4">
        {initialCoupons.map((coupon) => (
          <div key={coupon.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900">{coupon.code}</h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{coupon.description || "No description"}</p>
                <p className="mt-2 text-xs text-slate-500">Used {coupon._count.usage} times</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ id: coupon.id, code: coupon.code, usageLimit: coupon.usageLimit?.toString() ?? "", description: coupon.description ?? "", expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "", isActive: coupon.isActive })} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold">Edit</button>
                <button type="button" onClick={() => { void deleteCoupon(coupon.id); }} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

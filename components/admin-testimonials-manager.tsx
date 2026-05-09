"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { UploadedImageField } from "@/components/uploaded-image-field";

type Testimonial = {
  id: string;
  name: string;
  message: string;
  imagePath: string | null;
  isActive: boolean;
};

type FormState = {
  id?: string;
  name: string;
  message: string;
  imagePath: string;
  isActive: boolean;
};

export function AdminTestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const blank = useMemo<FormState>(() => ({ name: "", message: "", imagePath: "", isActive: true }), []);
  const [form, setForm] = useState<FormState>(blank);
  const [message, setMessage] = useState("");

  async function saveTestimonial() {
    const endpoint = form.id ? `/api/admin/testimonials/${form.id}` : "/api/admin/testimonials";
    const method = form.id ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "Testimonial saved." : "Unable to save testimonial."));
    if (response.ok) {
      setForm(blank);
      router.refresh();
    }
  }

  async function deleteTestimonial(id: string) {
    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "Testimonial deleted." : "Unable to delete testimonial."));
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900">{form.id ? "Edit testimonial" : "Create testimonial"}</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Customer Name</label>
            <input className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
          </div>
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 md:self-end">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} />
            Active testimonial
          </label>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Message</label>
            <textarea className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" rows={5} value={form.message} onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))} />
          </div>
          <UploadedImageField label="Customer Image" folder="testimonials" value={form.imagePath} onChange={(value) => setForm((c) => ({ ...c, imagePath: value }))} />
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => { void saveTestimonial(); }} className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">
            {form.id ? "Update testimonial" : "Create testimonial"}
          </button>
          {form.id ? <button type="button" onClick={() => setForm(blank)} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold">Cancel edit</button> : null}
        </div>
      </div>

      <div className="space-y-4">
        {initialTestimonials.length > 0 ? initialTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900">{testimonial.name}</h3>
                  <span className="rounded-full bg-stone-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                    {testimonial.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{testimonial.message}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ id: testimonial.id, name: testimonial.name, message: testimonial.message, imagePath: testimonial.imagePath ?? "", isActive: testimonial.isActive })} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold">Edit</button>
                <button type="button" onClick={() => { void deleteTestimonial(testimonial.id); }} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Delete</button>
              </div>
            </div>
          </div>
        )) : null}
      </div>
    </div>
  );
}

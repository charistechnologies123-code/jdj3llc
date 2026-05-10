"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/confirm-dialog";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  id?: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

export function AdminFaqsManager({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const router = useRouter();
  const blank = useMemo<FormState>(() => ({ question: "", answer: "", isActive: true, sortOrder: 0 }), []);
  const [form, setForm] = useState<FormState>(blank);
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function saveFaq() {
    const endpoint = form.id ? `/api/admin/faqs/${form.id}` : "/api/admin/faqs";
    const method = form.id ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      const errorMessage = payload.message ?? "Unable to save FAQ.";
      setMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setMessage(form.id ? "FAQ updated." : "FAQ created.");
    toast.success(form.id ? "FAQ updated successfully." : "FAQ created successfully.");
    setForm(blank);
    router.refresh();
  }

  async function deleteFaq(id: string) {
    setDeleting(true);
    const response = await fetch(`/api/admin/faqs/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      const errorMessage = payload.message ?? "Unable to delete FAQ.";
      setMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setMessage("FAQ deleted.");
    toast.success("FAQ deleted successfully.");
    if (form.id === id) {
      setForm(blank);
    }
    router.refresh();
    setDeleting(false);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900">{form.id ? "Edit FAQ" : "Create FAQ"}</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Question</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={form.question}
              onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Answer</label>
            <textarea
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              rows={5}
              value={form.answer}
              onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Sort Order</label>
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
            />
          </div>
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 md:self-end">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Active FAQ
          </label>
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => { void saveFaq(); }} className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">
            {form.id ? "Update FAQ" : "Create FAQ"}
          </button>
          {form.id ? (
            <button type="button" onClick={() => setForm(blank)} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold">
              Cancel edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {initialFaqs.map((faq) => (
          <div key={faq.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900">{faq.question}</h3>
                  <span className="rounded-full bg-stone-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                    {faq.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ id: faq.id, question: faq.question, answer: faq.answer, isActive: faq.isActive, sortOrder: faq.sortOrder })}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
                >
                  Edit
                </button>
                <button type="button" onClick={() => setPendingDelete(faq)} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete FAQ?"
        description={`This will permanently remove "${pendingDelete?.question ?? "this FAQ"}".`}
        confirmLabel="Delete FAQ"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void deleteFaq(pendingDelete.id);
        }}
      />
    </div>
  );
}

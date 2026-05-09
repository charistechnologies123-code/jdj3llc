"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { UploadedImageField } from "@/components/uploaded-image-field";

type ProductDefaults = {
  id?: string;
  name: string;
  categoryName: string;
  quantity: number;
  isFeatured: boolean;
  summary: string;
  description: string;
  imagePath: string;
};

export function AdminProductForm({
  defaults,
  submitLabel,
}: {
  defaults?: Partial<ProductDefaults>;
  submitLabel: string;
}) {
  const router = useRouter();
  const initialState = useMemo<ProductDefaults>(
    () => ({
      id: defaults?.id,
      name: defaults?.name ?? "",
      categoryName: defaults?.categoryName ?? "",
      quantity: defaults?.quantity ?? 0,
      isFeatured: defaults?.isFeatured ?? false,
      summary: defaults?.summary ?? "",
      description: defaults?.description ?? "",
      imagePath: defaults?.imagePath ?? "",
    }),
    [defaults],
  );
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const endpoint = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
      const method = form.id ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name,
          categoryName: form.categoryName,
          quantity: form.quantity,
          isFeatured: form.isFeatured,
          summary: form.summary,
          description: form.description,
          imagePath: form.imagePath,
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Unable to save product.");
        toast.error(payload.message ?? "Unable to save product.");
        return;
      }

      setMessage(form.id ? "Product updated." : "Product created.");
      toast.success(form.id ? "Product updated successfully." : "Product created successfully.");
      router.push("/admin/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-semibold">Product Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold">Product Category</label>
        <input
          type="text"
          value={form.categoryName}
          onChange={(event) => setForm((current) => ({ ...current, categoryName: event.target.value }))}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Spices, Pantry, Drinks..."
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold">Quantity Available</label>
        <input
          type="number"
          min={0}
          value={form.quantity}
          onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
          className="rounded border-slate-300"
        />
        Show this product on the homepage as featured
      </label>
      <div className="md:col-span-2">
        <label className="text-sm font-semibold">Short Summary</label>
        <input
          type="text"
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Optional short text shown on product cards"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-semibold">Description</label>
        <textarea
          rows={6}
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
      </div>
      <UploadedImageField
        label="Primary Product Image"
        folder="products"
        value={form.imagePath}
        onChange={(value) => setForm((current) => ({ ...current, imagePath: value }))}
      />
      {message ? <p className="text-sm text-slate-600 md:col-span-2">{message}</p> : null}
      <button
        disabled={saving}
        className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-60 md:justify-self-start"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

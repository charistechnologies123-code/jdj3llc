"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type ProductRow = {
  id: string;
  name: string;
  quantity: number;
  isFeatured: boolean;
  category: { name: string } | null;
};

export function AdminProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function removeProduct(id: string) {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "Product deleted." : "Unable to delete product."));
    if (response.ok) {
      toast.success("Product deleted successfully.");
      router.refresh();
    } else {
      toast.error(payload.message ?? "Unable to delete product.");
    }
  }

  return (
    <>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-50 text-slate-500">
          <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4">Featured</th><th className="px-6 py-4">Actions</th></tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-slate-100">
              <td className="px-6 py-4 font-semibold">{product.name}</td>
              <td className="px-6 py-4">{product.category?.name ?? "General"}</td>
              <td className="px-6 py-4">{product.quantity}</td>
              <td className="px-6 py-4">{product.isFeatured ? "Yes" : "No"}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void removeProduct(product.id);
                    }}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message ? <p className="px-6 py-4 text-sm text-slate-600">{message}</p> : null}
    </>
  );
}

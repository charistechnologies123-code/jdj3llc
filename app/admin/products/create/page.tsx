import Link from "next/link";

import { AdminProductForm } from "@/components/admin-product-form";
import { AdminShell } from "@/components/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminProductCreatePage() {
  return (
    <AdminShell title="Add Product">
      <div className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create product</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use image upload fields instead of pasted URLs. Product images are capped at 200 KB.
                </p>
              </div>
              <Link href="/admin/products" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700">
                Back to products
              </Link>
            </div>
            <AdminProductForm submitLabel="Save product" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

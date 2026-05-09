import Link from "next/link";

import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminProductsTable } from "@/components/admin-products-table";
import { AdminShell } from "@/components/admin-shell";
import { getAdminProducts } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <AdminShell title="Products">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-end">
            <Link href="/admin/products/create" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">
              Add product
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {products.length > 0 ? (
              <AdminProductsTable products={products} />
            ) : (
              <div className="p-6">
                <AdminEmptyState
                  title="No products yet"
                  description="Create your first product and upload its image file to start the catalog."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminProductForm } from "@/components/admin-product-form";
import { AdminShell } from "@/components/admin-shell";
import { getAdminProductById } from "@/lib/admin";

export const dynamic = "force-dynamic";

type ProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell title="Edit Product">
      <div className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Edit product</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Product id: <span className="font-black">{id}</span>. Replace images through file upload only.
                </p>
              </div>
              <Link href="/admin/products" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700">
                Back to products
              </Link>
            </div>
            <AdminProductForm
              submitLabel="Save changes"
              defaults={{
                id: product.id,
                name: product.name,
                categoryName: product.category?.name ?? "",
                quantity: product.quantity,
                isFeatured: product.isFeatured,
                summary: product.summary ?? "",
                description: product.description,
                imagePath: product.images[0]?.path ?? "",
              }}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

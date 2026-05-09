import { ProductCard } from "@/components/product-card";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type ShopPageProps = {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) ?? {};
  const categories = await getCatalogCategories();
  const allProducts = await getCatalogProducts();
  const search = params.search?.toLowerCase().trim() ?? "";
  const category = params.category?.trim() ?? "";

  const products = allProducts.filter((product) => {
    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(search) ||
      (product.summary ?? "").toLowerCase().includes(search);
    const matchesCategory = category === "" || product.category?.slug === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-orange-100 bg-white p-6 lg:max-w-xs">
          <h1 className="text-2xl font-black">Shop products</h1>
          <form className="mt-6 space-y-4">
            <input
              type="text"
              name="search"
              defaultValue={params.search ?? ""}
              placeholder="Search products"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <select
              name="category"
              defaultValue={params.category ?? ""}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption.id} value={categoryOption.slug}>
                  {categoryOption.name}
                </option>
              ))}
            </select>
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white">
              Apply filters
            </button>
          </form>
        </aside>
        <div className="flex-1">
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 xl:grid-cols-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="w-[76vw] max-w-[18rem] shrink-0 sm:w-auto sm:max-w-none sm:shrink sm:basis-auto">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="w-full rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 sm:col-span-2 md:col-span-3 xl:col-span-4">
                No products are available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

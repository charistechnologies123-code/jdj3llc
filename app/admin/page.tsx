import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminShell } from "@/components/admin-shell";
import { getAdminDashboardData } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { stats, recentOrders, recentProducts } = await getAdminDashboardData();

  return (
    <AdminShell title="Admin Dashboard">
      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Object.entries(stats).map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                  {label.replaceAll("_", " ")}
                </p>
                <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black">Recent orders</h3>
              <div className="mt-4 space-y-3">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="block rounded-2xl bg-stone-50 p-4">
                      <p className="font-black">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customerName} · {order.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <AdminEmptyState
                    title="No orders yet"
                    description="Orders will appear here after customers submit checkout requests."
                  />
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black">Product snapshot</h3>
              <div className="mt-4 space-y-3">
                {recentProducts.length > 0 ? (
                  recentProducts.map((product) => (
                    <div key={product.id} className="rounded-2xl bg-stone-50 p-4">
                      <p className="font-black">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {product._count.reviews} reviews · {product.quantity} in stock
                      </p>
                    </div>
                  ))
                ) : (
                  <AdminEmptyState
                    title="No products yet"
                    description="Add your first product to start building the storefront catalog."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

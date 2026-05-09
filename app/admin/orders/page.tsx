import Link from "next/link";

import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminShell } from "@/components/admin-shell";
import { getAdminOrders } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <AdminShell title="Orders">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {orders.length > 0 ? (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-slate-500">
                  <tr><th className="px-6 py-4">Order</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold">
                        <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4">{order.userType}</td>
                      <td className="px-6 py-4">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6">
                <AdminEmptyState
                  title="No orders yet"
                  description="Customer order requests will appear here once checkout is used."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

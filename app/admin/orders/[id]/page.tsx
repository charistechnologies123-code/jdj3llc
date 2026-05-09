import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { getAdminOrderById } from "@/lib/admin";

export const dynamic = "force-dynamic";

type AdminOrderShowPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderShowPage({ params }: AdminOrderShowPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <AdminShell title="Order Details">
      <div className="py-12">
        <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">Order</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{order.orderNumber}</h2>
              </div>
              <Link href="/admin/orders" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700">
                Back to orders
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Customer</p>
                <p className="mt-2 font-semibold text-slate-900">{order.customerName}</p>
                <p className="mt-1 text-sm text-slate-600">{order.customerEmail}</p>
                <p className="mt-1 text-sm text-slate-600">{order.customerPhone}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="mt-2 font-semibold text-slate-900">{order.status}</p>
                <p className="mt-1 text-sm text-slate-600">User type: {order.userType}</p>
                {order.couponCode ? (
                  <p className="mt-1 text-sm text-slate-600">Coupon: {order.couponCode}</p>
                ) : null}
              </div>
              <div className="rounded-2xl bg-stone-50 p-4 md:col-span-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Delivery address</p>
                <p className="mt-2 text-sm text-slate-700">{order.deliveryAddress}</p>
              </div>
              {order.notes ? (
                <div className="rounded-2xl bg-stone-50 p-4 md:col-span-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Notes</p>
                  <p className="mt-2 text-sm text-slate-700">{order.notes}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900">Order items</h3>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-stone-50 p-4">
                  <p className="font-semibold text-slate-900">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-600">Quantity: {item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

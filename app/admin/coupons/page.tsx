import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminCouponsManager } from "@/components/admin-coupons-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminCoupons } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <AdminShell title="Coupons">
      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <AdminCouponsManager initialCoupons={coupons} />
          {coupons.length === 0 ? (
            <div className="mt-8">
              <AdminEmptyState
                title="No coupons yet"
                description="Create a coupon above when you are ready to support promotional orders."
              />
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminReviewsManager } from "@/components/admin-reviews-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminReviews } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <AdminShell title="Reviews">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdminReviewsManager initialReviews={reviews} />
          {reviews.length === 0 ? (
            <div className="mt-8">
              <AdminEmptyState
                title="No reviews yet"
                description="Product reviews will appear here once customers start rating products."
              />
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

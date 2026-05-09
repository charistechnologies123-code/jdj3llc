import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminShell } from "@/components/admin-shell";
import { AdminTestimonialsManager } from "@/components/admin-testimonials-manager";
import { getAdminTestimonials } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <AdminShell title="Testimonials">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdminTestimonialsManager initialTestimonials={testimonials} />
          {testimonials.length === 0 ? (
            <div className="mt-8">
              <AdminEmptyState
                title="No testimonials yet"
                description="Customer testimonials will appear here after you upload them."
              />
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminFaqsManager } from "@/components/admin-faqs-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminFaqs } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await getAdminFaqs();

  return (
    <AdminShell title="FAQs">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdminFaqsManager initialFaqs={faqs} />
          {faqs.length === 0 ? (
            <div className="mt-8">
              <AdminEmptyState
                title="No FAQs yet"
                description="Published FAQs will show up here once you add them."
              />
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

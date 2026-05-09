import { AdminProfilePanel } from "@/components/admin-profile-panel";
import { AdminShell } from "@/components/admin-shell";

export const dynamic = "force-dynamic";

export default function AdminProfilePage() {
  return (
    <AdminShell title="Admin Profile">
      <div className="py-12">
        <AdminProfilePanel />
      </div>
    </AdminShell>
  );
}

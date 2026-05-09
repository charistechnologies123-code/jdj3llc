import { AdminEmptyState } from "@/components/admin-empty-state";
import { AdminShell } from "@/components/admin-shell";
import { AdminUsersManager } from "@/components/admin-users-manager";
import { getAdminUsers } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <AdminShell title="Users">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdminUsersManager initialUsers={users} />
          {users.length === 0 ? (
            <div className="mt-8">
              <AdminEmptyState
                title="No users yet"
                description="Customers and admins will show up here once accounts are created."
              />
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

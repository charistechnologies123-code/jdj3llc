"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/faqs", label: "FAQs" },
] as const;

function Sidebar({
  pathname,
  userName,
  userEmail,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  userName: string;
  userEmail: string;
  onLogout: () => Promise<void>;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/admin" className="flex items-center gap-3" onClick={onNavigate}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 font-black text-white">
          J
        </div>
        <div>
          <p className="text-xl font-black text-slate-900">JDJ3 Admin</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Operations Portal</p>
        </div>
      </Link>

      <nav className="mt-8 grid gap-2 text-sm font-semibold text-slate-700">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`rounded-2xl px-4 py-3 transition ${
              pathname === link.href
                ? "bg-orange-500 text-white"
                : "hover:bg-gray-100 hover:text-orange-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 rounded-3xl bg-stone-50 p-4 text-sm text-slate-600">
        <p className="font-black text-slate-900">{userName}</p>
        <p className="mt-1">{userEmail}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/" onClick={onNavigate} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold transition hover:bg-white">
            Storefront
          </Link>
          <button
            type="button"
            onClick={() => {
              void onLogout();
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoutAndExit = useMemo(
    () => async () => {
      await logout();
      router.push("/");
    },
    [logout, router],
  );

  if (!ready) {
    return <main className="px-6 py-12">Loading admin portal...</main>;
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Admin access required</h1>
          <p className="mt-4 text-sm text-slate-600">
            Use the JDJ3 admin login to access the operations portal.
          </p>
          <Link href="/admin-login" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">
            Go to admin login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white/95 px-5 py-6 lg:block">
        <Sidebar
          pathname={pathname}
          userName={user.name}
          userEmail={user.email}
          onLogout={logoutAndExit}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="h-full w-[280px] border-r border-slate-200 bg-white px-5 py-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 p-2 transition hover:bg-stone-100"
                aria-label="Close admin menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              pathname={pathname}
              userName={user.name}
              userEmail={user.email}
              onLogout={logoutAndExit}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-black text-slate-900">{title}</h1>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 p-3 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

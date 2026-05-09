"use client";

import { usePathname } from "next/navigation";

import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin-login" || pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}

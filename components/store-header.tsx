"use client";

import Link from "next/link";
import { ImageIcon, Menu, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { siteConfig } from "@/lib/site";

const links = [
  { href: "/shop" as const, label: "Shop" },
  { href: "/about" as const, label: "About" },
  { href: "/faqs" as const, label: "FAQs" },
  { href: "/testimonials" as const, label: "Testimonials" },
];

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [logoPath, setLogoPath] = useState("");
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    let active = true;

    async function loadBranding() {
      try {
        const response = await fetch("/api/branding", { cache: "no-store" });
        const payload = (await response.json()) as { logoPath?: string };
        if (active) {
          setLogoPath(payload.logoPath ?? "");
        }
      } catch {
        if (active) {
          setLogoPath("");
        }
      }
    }

    void loadBranding();
    const refreshBranding = () => {
      void loadBranding();
    };
    window.addEventListener("jdj3-branding-updated", refreshBranding);
    return () => {
      active = false;
      window.removeEventListener("jdj3-branding-updated", refreshBranding);
    };
  }, []);

  return (
    <header className="border-b border-[#edd8bf] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 transition duration-200 hover:opacity-90">
          <div className="flex h-12 w-24 items-center justify-center overflow-hidden p-1 sm:h-14 sm:w-28">
            {logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPath} alt={`${siteConfig.shortName} logo`} className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-lg font-black tracking-tight sm:text-xl">{siteConfig.shortName}</p>
            <p className="hidden text-xs uppercase tracking-[0.3em] text-slate-500 sm:block">
              Request-Based Ordering
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition duration-200 hover:-translate-y-0.5 hover:text-orange-600">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="transition duration-200 hover:-translate-y-0.5 hover:text-orange-600">Cart ({itemCount})</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/cart"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart ({itemCount})
          </Link>
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link href="/admin" className="inline-flex h-11 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]">
                  Admin Portal
                </Link>
              ) : (
                <Link href="/profile" className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="inline-flex h-11 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]">
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition duration-200 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]"
            aria-label={`Open cart with ${itemCount} items`}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">
                  {itemCount}
                </span>
              ) : null}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition duration-200 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]"
            aria-label="Open navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-stone-50 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.99]"
              >
                {link.label}
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Open</span>
              </Link>
            ))}
            <div className="my-1 h-px bg-slate-200" />
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.99]"
            >
              Cart ({itemCount})
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                {itemCount}
              </span>
            </Link>
            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/profile"}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.99]"
                >
                  {user.role === "ADMIN" ? "Admin Portal" : "Profile"}
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Open</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.99]"
                >
                  Log out
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Exit</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.99]"
              >
                Login
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Open</span>
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { enableGuestCheckout } from "@/lib/client-checkout";
import { isGuestCheckoutEnabled } from "@/lib/client-checkout";

export default function CheckoutAccessPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (user || isGuestCheckoutEnabled()) {
      router.replace("/checkout");
    }
  }, [ready, router, user]);

  if (!ready) {
    return null;
  }

  if (user || isGuestCheckoutEnabled()) {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">
          Checkout access
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Continue as guest or sign in before checkout
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Choose whether you want to finish this order with your JDJ3 account or keep going as a
          guest. Your cart will stay with you either way.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              enableGuestCheckout();
              router.push("/checkout");
            }}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white"
          >
            Continue as guest
          </button>
          <Link
            href="/login?redirect=checkout"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Log in
          </Link>
          <Link
            href="/register?redirect=checkout"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}

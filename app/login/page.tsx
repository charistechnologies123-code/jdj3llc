"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";
import { GuestShell } from "@/components/guest-shell";
import { PasswordField } from "@/components/password-field";
import { clearGuestCheckout } from "@/lib/client-checkout";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [checkoutRedirect, setCheckoutRedirect] = useState(false);

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    setCheckoutRedirect(redirect === "checkout");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await login({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!result.ok) {
      setError(result.message ?? "Unable to log in.");
      toast.error(result.message ?? "Unable to log in.");
      return;
    }

    clearGuestCheckout();
    toast.success("Welcome back.");
    router.push(checkoutRedirect ? "/checkout" : "/");
  }

  return (
    <GuestShell
      eyebrow="Customer login"
      title="Welcome back to JDJ3"
      description="Sign in to manage your profile, addresses, coupons, and order history."
    >
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none" />
        </div>
        <div className="mt-4">
          <PasswordField label="Password" name="password" />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link
            href={checkoutRedirect ? "/register?redirect=checkout" : "/register"}
            className="text-sm font-semibold text-slate-600 transition hover:text-orange-600"
          >
            Create account
          </Link>
          <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0 active:scale-[0.98]">Log in</button>
        </div>
      </form>
    </GuestShell>
  );
}

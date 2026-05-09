"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";
import { GuestShell } from "@/components/guest-shell";
import { PasswordField } from "@/components/password-field";
import { clearGuestCheckout } from "@/lib/client-checkout";

export function RegisterForm({ referralCode }: { referralCode?: string }) {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [checkoutRedirect, setCheckoutRedirect] = useState(false);

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    setCheckoutRedirect(redirect === "checkout");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("password_confirmation") ?? "");

    if (password !== confirm) {
      setError("Password confirmation does not match.");
      toast.error("Password confirmation does not match.");
      return;
    }

    const result = await register({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phoneNumber: String(formData.get("phone_number") ?? ""),
      password,
      referralCodeInput: String(formData.get("referral_code_input") ?? "") || undefined,
    });

    if (!result.ok) {
      setError(result.message ?? "Unable to register.");
      toast.error(result.message ?? "Unable to register.");
      return;
    }

    clearGuestCheckout();
    toast.success("Your account has been created.");
    router.push(checkoutRedirect ? "/checkout" : "/");
  }

  return (
    <GuestShell title="Create your JDJ3 account" description="Register to manage addresses, referrals, and future order history.">
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold">Name</label>
          <input name="name" type="text" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Email</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Phone Number (WhatsApp preferred)</label>
          <input name="phone_number" type="text" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Referral Code (Optional)</label>
          <input
            name="referral_code_input"
            type="text"
            defaultValue={referralCode ?? ""}
            className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none"
          />
        </div>
        <div className="mt-4">
          <PasswordField label="Password" name="password" />
        </div>
        <div className="mt-4">
          <PasswordField label="Confirm Password" name="password_confirmation" />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link
            href={checkoutRedirect ? "/login?redirect=checkout" : "/login"}
            className="text-sm font-semibold text-slate-600 transition hover:text-orange-600"
          >
            Already registered?
          </Link>
          <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0 active:scale-[0.98]">Register</button>
        </div>
      </form>
    </GuestShell>
  );
}

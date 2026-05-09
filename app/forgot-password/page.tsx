"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { GuestShell } from "@/components/guest-shell";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <GuestShell
      title="Forgot your password?"
      description="This Next app route now matches the Laravel auth surface. Email delivery will be connected once persisted auth is live."
    >
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>
        {submitted ? (
          <p className="mt-4 text-sm text-emerald-700">
            Password reset delivery is pending real backend wiring. The route is in place.
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600">
            Back to login
          </Link>
          <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">
            Email reset link
          </button>
        </div>
      </form>
    </GuestShell>
  );
}

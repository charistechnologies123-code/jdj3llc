"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { GuestShell } from "@/components/guest-shell";

type ResetPasswordPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  void params.then((resolved) => {
    if (tokenValue === null) {
      setTokenValue(resolved.token);
    }
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("password_confirmation") ?? "");

    if (password !== confirm) {
      setError("Password confirmation does not match.");
      return;
    }

    router.push("/login");
  }

  return (
    <GuestShell
      title="Reset your password"
      description="This mirrors Laravel’s reset route. Token handling will be connected to persisted auth once backend password reset is implemented."
    >
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold">Reset token</label>
          <input
            readOnly
            value={tokenValue ?? "Loading token..."}
            className="mt-1 block w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm"
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Email</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">New password</label>
          <input name="password" type="password" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Confirm password</label>
          <input
            name="password_confirmation"
            type="password"
            required
            className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600">
            Back to login
          </Link>
          <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">
            Reset password
          </button>
        </div>
      </form>
    </GuestShell>
  );
}

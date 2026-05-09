"use client";

import { FormEvent, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { UploadedImageField } from "@/components/uploaded-image-field";

export function AdminProfilePanel() {
  const { user, refreshAccount } = useAuth();
  const [avatarPath, setAvatarPath] = useState(user?.avatarPath ?? "");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  async function saveAvatar() {
    const response = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ avatarPath }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setProfileMessage(payload.message ?? "Unable to save profile.");
      return;
    }

    await refreshAccount();
    window.dispatchEvent(new Event("jdj3-branding-updated"));
    setProfileMessage("Profile updated.");
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("current_password") ?? "");
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("password_confirmation") ?? "");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Password confirmation does not match.");
      return;
    }

    const response = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const payload = (await response.json()) as { message?: string };
    setPasswordMessage(payload.message ?? (response.ok ? "Password updated." : "Unable to update password."));

    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">Account</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">{user?.name ?? "Administrator profile"}</h1>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <p className="font-black uppercase tracking-[0.2em] text-slate-500">Email</p>
            <p className="mt-1">{user?.email ?? "No admin session loaded yet."}</p>
          </div>
          <div>
            <p className="font-black uppercase tracking-[0.2em] text-slate-500">Role</p>
            <p className="mt-1">Administrator</p>
          </div>
        </div>
        <div className="mt-8">
          <UploadedImageField
            label="Company logo / admin avatar"
            folder="avatars"
            value={avatarPath}
            onChange={setAvatarPath}
          />
          <button
            type="button"
            onClick={() => {
              void saveAvatar();
            }}
            className="mt-4 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98]"
          >
            Save logo
          </button>
          {profileMessage ? <p className="mt-3 text-sm text-slate-600">{profileMessage}</p> : null}
        </div>
      </div>

      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Change password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Update the admin password used to access the operations portal.
        </p>
        <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
          <input
            name="current_password"
            type="password"
            placeholder="Current password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="New password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none"
          />
          <input
            name="password_confirmation"
            type="password"
            placeholder="Confirm new password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none"
          />
          {passwordMessage ? <p className="text-sm text-slate-600">{passwordMessage}</p> : null}
          <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98]">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}

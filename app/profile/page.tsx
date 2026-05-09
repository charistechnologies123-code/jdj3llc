"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user, referrals, ready, updatePassword, addAddress, updateAddress, deleteAddress } = useAuth();
  const router = useRouter();
  const [passwordMessage, setPasswordMessage] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (ready && (!user || user.role !== "CUSTOMER")) {
      router.push("/login");
    }
  }, [ready, router, user]);

  if (!ready) {
    return <main className="px-6 py-12">Loading profile...</main>;
  }

  if (!user || user.role !== "CUSTOMER") {
    return null;
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("password_confirmation") ?? "");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Password confirmation does not match.");
      toast.error("Password confirmation does not match.");
      return;
    }

    const result = await updatePassword(
      String(formData.get("current_password") ?? ""),
      newPassword,
    );
    setPasswordMessage(result.message ?? (result.ok ? "Password updated." : "Unable to update password."));
    if (result.ok) {
      toast.success("Password updated successfully.");
      event.currentTarget.reset();
    } else {
      toast.error(result.message ?? "Unable to update password.");
    }
  }

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addAddress({
      label: String(formData.get("label") ?? ""),
      recipientName: String(formData.get("recipient_name") ?? ""),
      phoneNumber: String(formData.get("phone_number") ?? ""),
      addressLine1: String(formData.get("address_line_1") ?? ""),
      addressLine2: String(formData.get("address_line_2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postal_code") ?? ""),
      country: String(formData.get("country") ?? "USA"),
      isDefault: formData.get("is_default") === "1",
    });
    setAddressMessage(result.message ?? (result.ok ? "Address saved." : "Unable to save address."));
    if (result.ok) {
      toast.success("Delivery address saved.");
      event.currentTarget.reset();
      setShowAddressForm(false);
    } else {
      toast.error(result.message ?? "Unable to save address.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">My profile</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">{user.name}</h1>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-slate-500">Email</p>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-slate-500">Contact</p>
                <p className="mt-1">{user.phoneNumber}</p>
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-slate-500">Referral code</p>
                <p className="mt-1 rounded-2xl bg-stone-50 px-4 py-3 font-black text-slate-900">{user.referralCode}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Change password</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your name, email, and contact details are managed by JDJ3. You can update only your
              password here.
            </p>
            <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
              <input name="current_password" type="password" placeholder="Current password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="password" type="password" placeholder="New password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="password_confirmation" type="password" placeholder="Confirm new password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              {passwordMessage ? <p className="text-sm text-slate-600">{passwordMessage}</p> : null}
              <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">Update password</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Referral activity</h2>
            <p className="mt-2 text-sm text-slate-600">
              Track people who registered or ordered using your referral code.
            </p>
            <div className="mt-6 space-y-4">
              {referrals.length === 0 ? (
                <p className="rounded-2xl bg-stone-50 p-4 text-sm text-slate-500">No referred users yet.</p>
              ) : (
                referrals.map((referral) => (
                  <div key={referral.id} className="rounded-3xl border border-slate-200 bg-stone-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-black text-slate-900">
                        {referral.referredUserName ?? "Pending referral"}
                      </p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                        {referral.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {referral.referredUserEmail ?? "Waiting for a referred account to be linked."}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Code used: {referral.referralCode}
                      {referral.orderNumber ? ` · Order ${referral.orderNumber}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Delivery addresses</h2>
              <p className="mt-2 text-sm text-slate-600">
                Add as many delivery addresses as you need. You can choose any of them during checkout.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {user.addresses.length > 0 ? (
                user.addresses.map((address) => (
                  <div key={address.id} className="rounded-3xl border border-slate-200 bg-stone-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-black text-slate-900">{address.label || "Saved address"}</p>
                          {address.isDefault ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-700">{address.recipientName}</p>
                        <p className="mt-1 text-sm text-slate-600">{address.phoneNumber}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {address.addressLine1}
                          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                          {`, ${address.city}, ${address.state} ${address.postalCode ?? ""}, ${address.country}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!address.isDefault ? (
                          <button
                            type="button"
                            onClick={async () => {
                              const result = await updateAddress(address.id, {
                                ...address,
                                isDefault: true,
                              });
                              setAddressMessage(
                                result.message ??
                                  (result.ok ? "Default address updated." : "Unable to update address."),
                              );
                              if (result.ok) {
                                toast.success("Default delivery address updated.");
                              } else {
                                toast.error(result.message ?? "Unable to update address.");
                              }
                            }}
                            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
                          >
                            Set as default
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await deleteAddress(address.id);
                            setAddressMessage(
                              result.message ?? (result.ok ? "Address deleted." : "Unable to delete address."),
                            );
                            if (result.ok) {
                              toast.success("Delivery address deleted.");
                            } else {
                              toast.error(result.message ?? "Unable to delete address.");
                            }
                          }}
                          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-stone-50 p-4 text-sm text-slate-500">
                  You have not added any saved delivery address yet.
                </p>
              )}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <button
                type="button"
                onClick={() => setShowAddressForm((current) => !current)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]"
              >
                {showAddressForm ? "Hide delivery address form" : "Add delivery address"}
              </button>

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="mt-6 grid gap-4 md:grid-cols-2">
                  <input name="label" type="text" placeholder="Label: Home, Office..." className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  <input name="recipient_name" type="text" defaultValue={user.name} placeholder="Recipient name" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  <input name="phone_number" type="text" defaultValue={user.phoneNumber} placeholder="Contact number" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" />
                  <input name="address_line_1" type="text" placeholder="Address line 1" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" />
                  <input name="address_line_2" type="text" placeholder="Address line 2 (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" />
                  <input name="city" type="text" placeholder="City" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  <input name="state" type="text" placeholder="State" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  <input name="postal_code" type="text" placeholder="Postal code" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  <input name="country" type="text" defaultValue="USA" placeholder="Country" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  <label className="inline-flex items-center gap-3 text-sm text-slate-600 md:col-span-2">
                    <input name="is_default" value="1" type="checkbox" className="rounded border-slate-300" />
                    Make this my default address
                  </label>
                  {addressMessage ? <p className="text-sm text-slate-600 md:col-span-2">{addressMessage}</p> : null}
                  <button className="md:col-span-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">Save delivery address</button>
                </form>
              ) : addressMessage ? (
                <p className="mt-4 text-sm text-slate-600">{addressMessage}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

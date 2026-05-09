"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { clearGuestCheckout, isGuestCheckoutEnabled } from "@/lib/client-checkout";

type CheckoutFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
  couponCode: string;
  saveAddress: boolean;
  setDefaultAddress: boolean;
};

const emptyAddressState = {
  label: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, ready, refreshAccount } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [guestMode, setGuestMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [formState, setFormState] = useState<CheckoutFormState>({
    name: "",
    email: "",
    phoneNumber: "",
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    notes: "",
    couponCode: "",
    saveAddress: true,
    setDefaultAddress: false,
  });

  const summary = useMemo(() => items, [items]);
  const defaultAddress = user?.addresses.find((address) => address.isDefault) ?? user?.addresses[0] ?? null;

  useEffect(() => {
    if (!ready) return;

    if (user) {
      clearGuestCheckout();
      setGuestMode(false);
      setSelectedAddressId((current) => current || defaultAddress?.id || "");
      setFormState((current) => ({
        ...current,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || current.phoneNumber,
        country: current.country || "USA",
      }));
      return;
    }

    const guestEnabled = isGuestCheckoutEnabled();
    setGuestMode(guestEnabled);
    if (!guestEnabled) {
      router.replace("/checkout/access");
    }
  }, [defaultAddress?.id, ready, router, user]);

  useEffect(() => {
    if (!defaultAddress || useNewAddress || !user) return;

    setSelectedAddressId((current) => current || defaultAddress.id);
  }, [defaultAddress, useNewAddress, user]);

  useEffect(() => {
    if (user && user.addresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user && !guestMode) {
      router.push("/checkout/access");
      return;
    }

    if (summary.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!user && formState.couponCode.trim()) {
      const message = "Guest users are not allowed to use coupon codes.";
      setError(message);
      toast.error(message);
      return;
    }

    if (user && !useNewAddress && !selectedAddressId) {
      const message = "Choose a saved delivery address or enter a new one.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = user
        ? {
            couponCode: formState.couponCode,
            notes: formState.notes,
            items: summary.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            ...(useNewAddress
              ? {
                  label: formState.label,
                  addressLine1: formState.addressLine1,
                  addressLine2: formState.addressLine2,
                  city: formState.city,
                  state: formState.state,
                  postalCode: formState.postalCode,
                  country: formState.country,
                  saveAddress: formState.saveAddress,
                  setDefaultAddress: formState.setDefaultAddress,
                }
              : {
                  addressId: selectedAddressId,
                }),
          }
        : {
            name: formState.name,
            email: formState.email,
            phoneNumber: formState.phoneNumber,
            addressLine1: formState.addressLine1,
            addressLine2: formState.addressLine2,
            city: formState.city,
            state: formState.state,
            postalCode: formState.postalCode,
            country: formState.country,
            notes: formState.notes,
            couponCode: formState.couponCode,
            items: summary.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
          };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const payloadResponse = (await response.json()) as { ok?: boolean; message?: string; orderNumber?: string };

      if (!response.ok) {
        const message = payloadResponse.message ?? "Unable to submit your order request.";
        setError(message);
        toast.error(message);
        return;
      }

      setOrderNumber(payloadResponse.orderNumber ?? "");
      setSubmitted(true);
      clearCart();
      clearGuestCheckout();
      await refreshAccount();
      toast.success("Order request submitted successfully.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) {
    return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">Loading checkout...</main>;
  }

  if (!user && !guestMode) {
    return null;
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Order request received</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We have saved your order request to JDJ3. The team will review it and follow up by
            WhatsApp or email with final pricing and payment instructions.
          </p>
          {orderNumber ? (
            <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm font-black text-slate-900">
              Order number: {orderNumber}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">Checkout</h1>

          {user ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl bg-stone-50 p-5">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                  Account details
                </p>
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>{user.name}</p>
                  <p>{user.email}</p>
                  <p>{user.phoneNumber}</p>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Delivery address</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Choose one of your saved addresses or enter a new one for this order.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress((current) => !current);
                      if (!useNewAddress && defaultAddress) {
                        setFormState((current) => ({
                          ...current,
                          ...emptyAddressState,
                          label: "",
                          saveAddress: true,
                          setDefaultAddress: false,
                        }));
                      }
                    }}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]"
                  >
                    {useNewAddress ? "Use saved address" : "Enter new address"}
                  </button>
                </div>

                {!useNewAddress ? (
                  <div className="mt-5 space-y-4">
                    {user.addresses.length > 0 ? (
                      user.addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`block cursor-pointer rounded-3xl border p-5 transition ${
                            selectedAddressId === address.id
                              ? "border-orange-300 bg-orange-50"
                              : "border-slate-200 bg-stone-50 hover:border-orange-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="saved_address"
                              checked={selectedAddressId === address.id}
                              onChange={() => setSelectedAddressId(address.id)}
                              className="mt-1"
                            />
                            <div className="min-w-0">
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
                                {`, ${address.city}, ${address.state} ${address.postalCode || ""}, ${address.country}`}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="rounded-3xl bg-stone-50 p-5 text-sm text-slate-500">
                        You do not have any saved addresses yet. Enter a new one to continue.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      name="label"
                      placeholder="Address label: Home, Office..."
                      value={formState.label}
                      onChange={(event) => setFormState((current) => ({ ...current, label: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
                    <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-slate-600">
                      Delivery contact will use your saved phone number automatically.
                    </div>
                    <input
                      type="text"
                      name="address_line_1"
                      placeholder="Delivery address"
                      value={formState.addressLine1}
                      onChange={(event) => setFormState((current) => ({ ...current, addressLine1: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                      required={useNewAddress}
                    />
                    <input
                      type="text"
                      name="address_line_2"
                      placeholder="Apartment / suite (optional)"
                      value={formState.addressLine2}
                      onChange={(event) => setFormState((current) => ({ ...current, addressLine2: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formState.city}
                      onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                      required={useNewAddress}
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formState.state}
                      onChange={(event) => setFormState((current) => ({ ...current, state: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                      required={useNewAddress}
                    />
                    <input
                      type="text"
                      name="postal_code"
                      placeholder="Postal code"
                      value={formState.postalCode}
                      onChange={(event) => setFormState((current) => ({ ...current, postalCode: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
                    <input
                      type="text"
                      name="country"
                      value={formState.country}
                      onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                      required={useNewAddress}
                    />
                    <label className="inline-flex items-center gap-3 text-sm text-slate-600 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={formState.saveAddress}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, saveAddress: event.target.checked }))
                        }
                        className="rounded border-slate-300"
                      />
                      Save this address to my profile
                    </label>
                    <label className="inline-flex items-center gap-3 text-sm text-slate-600 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={formState.setDefaultAddress}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            saveAddress: event.target.checked ? true : current.saveAddress,
                            setDefaultAddress: event.target.checked,
                          }))
                        }
                        className="rounded border-slate-300"
                      />
                      Set this as my default delivery address
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
              <input
                type="text"
                name="phone_number"
                placeholder="WhatsApp / Phone number"
                value={formState.phoneNumber}
                onChange={(event) => setFormState((current) => ({ ...current, phoneNumber: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                required
              />
              <input
                type="text"
                name="address_line_1"
                placeholder="Delivery address"
                value={formState.addressLine1}
                onChange={(event) => setFormState((current) => ({ ...current, addressLine1: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                required
              />
              <input
                type="text"
                name="address_line_2"
                placeholder="Apartment / suite (optional)"
                value={formState.addressLine2}
                onChange={(event) => setFormState((current) => ({ ...current, addressLine2: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formState.city}
                onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formState.state}
                onChange={(event) => setFormState((current) => ({ ...current, state: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
              <input
                type="text"
                name="postal_code"
                placeholder="Postal code"
                value={formState.postalCode}
                onChange={(event) => setFormState((current) => ({ ...current, postalCode: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                type="text"
                name="country"
                value={formState.country}
                onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
          )}

          <textarea
            name="notes"
            rows={5}
            placeholder="Order notes: call before delivery, make it spicy..."
            value={formState.notes}
            onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
            className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Order summary</h2>
          <div className="mt-6 space-y-4">
            {summary.length > 0 ? (
              summary.map((item) => (
                <div key={item.id} className="rounded-2xl bg-stone-50 p-4">
                  <p className="font-black">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-stone-50 p-4 text-sm text-slate-500">
                Your cart is empty.
              </div>
            )}
          </div>
          <div className="mt-6">
            <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Coupon</label>
            <input
              type="text"
              name="coupon_code"
              placeholder="Enter coupon code"
              value={formState.couponCode}
              onChange={(event) => setFormState((current) => ({ ...current, couponCode: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              Coupons are checked during submission. Guest users cannot use coupon codes.
            </p>
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <button
            disabled={summary.length === 0}
            className="mt-8 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit order request"}
          </button>
          <p className="mt-4 text-sm text-slate-500">
            After submission, JDJ3 will contact you by WhatsApp or email with final pricing and
            payment instructions.
          </p>
        </div>
      </form>
    </main>
  );
}

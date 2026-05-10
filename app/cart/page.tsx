"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { isGuestCheckoutEnabled } from "@/lib/client-checkout";

export default function CartPage() {
  const { items, updateItem, removeItem } = useCart();
  const { user, ready } = useAuth();
  const canGoStraightToCheckout = Boolean(user) || (ready && isGuestCheckoutEnabled());
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Your cart</h1>
          <Link href="/shop" className="text-sm font-black text-slate-600">
            Continue shopping
          </Link>
        </div>
        <div className="mt-8 space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-3xl bg-stone-50 p-5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <h2 className="text-xl font-black">{item.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">Quantity selected: {item.quantity}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, Number(event.target.value))}
                      className="w-24 rounded-full border border-slate-200 px-4 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toast.success(`${item.name} quantity updated.`)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                    >
                      Update
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingRemove({ id: item.id, name: item.name })}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">Your cart is empty right now.</p>
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-8">
            <Link
              href={canGoStraightToCheckout ? "/checkout" : "/checkout/access"}
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white"
            >
              Proceed to checkout
            </Link>
          </div>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Remove item from cart?"
        description={`This will remove ${pendingRemove?.name ?? "this item"} from your cart.`}
        confirmLabel="Remove item"
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (!pendingRemove) return;
          removeItem(pendingRemove.id);
          toast.success(`${pendingRemove.name} removed from cart.`);
          setPendingRemove(null);
        }}
      />
    </main>
  );
}

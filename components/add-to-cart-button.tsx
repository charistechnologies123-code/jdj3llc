"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useCart } from "@/components/cart-provider";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    quantity: number;
    requestPriceLabel: string;
    primaryImage?: { path: string; altText: string | null } | null;
  };
};

export function AddToCartButton({ product }: Props) {
  const [quantityInput, setQuantityInput] = useState(product.quantity > 0 ? "1" : "");
  const { addItem } = useCart();
  const quantity = quantityInput === "" ? 0 : Number(quantityInput);

  const disabled = product.quantity < 1 || quantity < 1;

  function normalizeQuantity(value: string) {
    if (value === "") {
      setQuantityInput("");
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(product.quantity, Math.max(1, parsed));
    setQuantityInput(String(clamped));
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        type="number"
        min={1}
        max={product.quantity}
        value={quantityInput}
        onChange={(event) => setQuantityInput(event.target.value)}
        onBlur={(event) => normalizeQuantity(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm transition duration-200 focus:border-orange-300 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] focus:outline-none sm:w-24"
        disabled={product.quantity < 1}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          normalizeQuantity(quantityInput);
          if (quantity < 1) {
            toast.error("Choose a valid quantity first.");
            return;
          }

          addItem({
            id: product.id,
            slug: product.slug,
            name: product.name,
            quantity,
            image: product.primaryImage?.path ?? null,
            requestPriceLabel: product.requestPriceLabel,
          });
          toast.success(`${product.name} has been added to cart.`);
        }}
        className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {product.quantity > 0 ? "Add to cart" : "Out of stock"}
      </button>
    </div>
  );
}

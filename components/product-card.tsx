import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { buildWhatsAppUrl } from "@/lib/site";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    summary: string | null;
    requestPriceLabel: string;
    quantity: number;
    category: { name: string; slug: string } | null;
    primaryImage: { path: string; altText: string | null } | null;
  };
};

export function ProductCard({ product }: Props) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-[1.25rem] border border-orange-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:rounded-[1.5rem] sm:p-4">
      <div className="aspect-[1.24/1] overflow-hidden rounded-[1rem] bg-stone-100 sm:aspect-[1.12/1] sm:rounded-[1.25rem]">
        {product.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImage.path}
            alt={product.primaryImage.altText ?? product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No image yet
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black leading-tight sm:text-xl">{product.name}</h2>
          <p className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm">{product.category?.name ?? "General"}</p>
        </div>
        <span className="shrink-0 self-start rounded-2xl bg-orange-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-orange-600 sm:px-3 sm:text-xs">
          {product.quantity} left
        </span>
      </div>
      <p className="mt-3 min-h-[3.75rem] text-xs leading-6 text-slate-600 sm:min-h-[4.5rem] sm:text-sm">
        {product.summary ?? "Request-based pricing with a manual review flow before payment is finalized."}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <a
          href={buildWhatsAppUrl(`Hello, I want the price for ${product.name}`)}
          className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-center text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-[0.98] sm:text-sm"
        >
          {product.requestPriceLabel}
        </a>
        <Link href={`/products/${product.slug}`} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-center text-xs font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98] sm:text-sm">
          View details
        </Link>
      </div>
      <AddToCartButton product={product} />
    </article>
  );
}

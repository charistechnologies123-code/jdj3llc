import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductReviews } from "@/components/product-reviews";
import { getProductBySlug } from "@/lib/catalog";
import { buildWhatsAppUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/shop" className="text-sm font-medium text-[var(--accent)]">
          Back to shop
        </Link>
        <section className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0].path}
                  alt={product.images[0].altText ?? product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                  No product image yet
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {product.images.slice(1, 4).map((image) => (
                <div
                  key={image.id}
                  className="aspect-[4/3] overflow-hidden rounded-md border border-[var(--line)] bg-[var(--panel)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.path}
                    alt={image.altText ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">
              {product.category?.name ?? "Store product"}
            </p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">{product.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                {product.requestPriceLabel}
              </span>
              <span className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                Quantity available: {product.quantity}
              </span>
            </div>
            <div className="mt-2">
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  quantity: product.quantity,
                  requestPriceLabel: product.requestPriceLabel,
                  primaryImage: product.primaryImage,
                }}
              />
            </div>
            <div className="mt-3">
              <a
                href={buildWhatsAppUrl(`Hello, I want the price for ${product.name}`)}
                className="inline-flex rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white"
              >
                Request price on WhatsApp
              </a>
            </div>
            <div className="mt-6 border-t border-[var(--line)] pt-6">
              <h2 className="text-lg font-semibold">Order notes</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
                Use checkout notes to tell the JDJ3 team about spice level, substitutions,
                delivery instructions, or any product questions they should review before final
                pricing is confirmed.
              </p>
            </div>
          </div>
        </section>
        <ProductReviews productId={product.id} productSlug={product.slug} initialReviews={product.reviews} />
      </div>
    </main>
  );
}

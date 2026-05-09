import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFaqs, getFeaturedProducts, getTestimonials } from "@/lib/catalog";
import { buildWhatsAppUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, testimonials, faqs] = await Promise.all([
    getFeaturedProducts(),
    getTestimonials(),
    getFaqs(),
  ]);

  return (
    <main>
      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-orange-300">
              African supermarket in motion
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Browse online. Request your order. Finalize payment after we review it.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
              JDJ3 African Supermarket is built to help customers shop faster while keeping pricing
              and payment confirmation under manual control.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">
                Start shopping
              </Link>
              <a href={buildWhatsAppUrl()} className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white">
                Request price on WhatsApp
              </a>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] bg-white/5 p-6 backdrop-blur">
            <div className="rounded-3xl bg-white px-6 py-5 text-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">Delivery</p>
              <p className="mt-2 text-2xl font-black">3-5 days</p>
            </div>
            <div className="rounded-3xl border border-white/10 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Payments</p>
              <p className="mt-2 text-base text-slate-200">
                Pricing is confirmed manually after your order request is reviewed.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Returns</p>
              <p className="mt-2 text-base text-slate-200">
                No return policy. Please use the notes field for special instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              readOnly
              value="Search and category filters are available in the shop view."
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500"
            />
            <Link href="/shop" className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-black text-white">
              Search the shop
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">Featured shelf</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Shop popular picks</h2>
          </div>
          <Link href="/shop" className="text-sm font-black text-slate-700">
            View all products
          </Link>
        </div>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.id} className="w-[76vw] max-w-[18rem] shrink-0 sm:w-auto sm:max-w-none sm:shrink sm:basis-auto">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="w-full rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 sm:col-span-2 md:col-span-3 xl:col-span-4">
              No products have been added yet.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.length > 0 ? (
            testimonials.slice(0, 3).map((testimonial) => (
              <article key={testimonial.id} className="rounded-[2rem] bg-slate-900 p-6 text-white">
                <p className="text-lg leading-8 text-slate-200">
                  &ldquo;{testimonial.message}&rdquo;
                </p>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.3em] text-orange-300">
                  {testimonial.name}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 lg:col-span-3">
              No testimonials have been published yet.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">FAQs</p>
          <div className="mt-6 space-y-4">
            {faqs.length > 0 ? (
              faqs.slice(0, 5).map((faq) => (
                <div key={faq.id} className="rounded-2xl bg-stone-50 p-5">
                  <h3 className="text-lg font-black">{faq.question}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-stone-50 p-5 text-sm text-slate-500">
                No FAQs have been added yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

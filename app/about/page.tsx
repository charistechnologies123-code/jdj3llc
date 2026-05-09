import { getCatalogProducts, getTestimonials } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [products, testimonials] = await Promise.all([getCatalogProducts(), getTestimonials()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-slate-900 p-10 text-white">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">About us</p>
        <h1 className="mt-4 text-5xl font-black">
          Built to make African grocery shopping feel more personal.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          JDJ3 combines the convenience of online browsing with the trust of manual order review.
          Customers shop on the website, submit requests, and then hear back from the team with
          final pricing and payment details.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white/10 p-6">
            <p className="text-3xl font-black">{products.length}</p>
            <p className="mt-2 text-sm text-slate-300">Products tracked in the catalog</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <p className="text-3xl font-black">{testimonials.length}</p>
            <p className="mt-2 text-sm text-slate-300">Customer stories curated by the admin</p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { getTestimonials } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">What customers say</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article key={testimonial.id} className="rounded-[2rem] bg-slate-900 p-6 text-white">
            <p className="text-lg leading-8 text-slate-200">
              &ldquo;{testimonial.message}&rdquo;
            </p>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-orange-300">
              {testimonial.name}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}

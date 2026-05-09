import { getFaqs } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const faqs = await getFaqs();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">Frequently asked questions</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <article key={faq.id} className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">{faq.question}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

const workstreams = [
  "Catalog and product detail pages",
  "Session cart replacement",
  "Checkout transaction and email flow",
  "Customer auth and saved addresses",
  "Admin product/order operations",
  "Uploads moved from local disk to object storage",
];

export default function MigrationPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[0_20px_60px_rgba(60,40,10,0.08)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Migration map
        </p>
        <h1 className="mt-4 text-4xl font-semibold">What we are replacing from Laravel</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">
          The old app now lives in the <code className="rounded bg-black/5 px-1 py-0.5">laravel/</code>
          folder for reference. The root Next.js app evolves in parallel while we match behavior
          route by route and model by model.
        </p>
        <div className="mt-8 grid gap-3">
          {workstreams.map((item, index) => (
            <div
              key={item}
              className="flex min-h-14 items-center gap-4 rounded-md border border-[var(--line)] bg-white/70 px-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-sm font-medium text-[var(--ink)]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

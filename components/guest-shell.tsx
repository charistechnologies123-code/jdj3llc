export function GuestShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-220px)] max-w-lg items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          {eyebrow ? (
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 text-3xl font-black text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

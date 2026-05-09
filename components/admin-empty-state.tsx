export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
      <p className="font-black text-slate-900">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}

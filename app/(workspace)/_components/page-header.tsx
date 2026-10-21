export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-slate-400">{description}</p>
    </header>
  );
}

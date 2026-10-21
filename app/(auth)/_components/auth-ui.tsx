import Link from "next/link";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full max-w-105 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-10">
      <Link
        className="inline-flex items-baseline gap-2 text-2xl font-bold tracking-tighter text-blue-700"
        href="/"
      >
        LINK
        <span className="text-[9px] font-semibold tracking-widest text-slate-500">
          TEAM HUB
        </span>
      </Link>
      <h1 className="mt-8 mb-2 text-3xl leading-tight font-semibold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mb-7 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}

export const authButtonClass =
  "flex min-h-11 w-full cursor-pointer items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none";

export function AuthForm({ children }: { children: React.ReactNode }) {
  return <form className="grid gap-4">{children}</form>;
}

export function AuthField({
  label,
  id,
  ...props
}: { label: string; id: string } & React.ComponentProps<"input">) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-3 focus:outline-blue-600/20"
        id={id}
        name={id}
        {...props}
      />
    </div>
  );
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="mt-1 min-h-11 cursor-pointer rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
      type="submit"
    >
      {children}
    </button>
  );
}

export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-500 [&_a]:font-semibold [&_a]:text-blue-700 [&_a]:hover:underline">
      {children}
    </p>
  );
}

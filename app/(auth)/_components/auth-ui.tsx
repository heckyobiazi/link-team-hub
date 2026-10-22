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
    <section className="w-full max-w-105 rounded-2xl border border-blue-500 bg-linear-to-r from-black/50 to-blue-500 p-6 shadow-xl shadow-blue-900 sm:p-10">
      <Link
        className="inline-flex items-baseline gap-2 text-2xl font-bold tracking-tighter text-blue-700"
        href="/">
        <img src="/LINK Logo White.svg" alt="LINK Team Hub" className="h-8 w-auto" />
      </Link>
      <h1 className="mt-8 mb-2 text-white text-3xl leading-tight font-semibold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mb-7 text-sm leading-relaxed text-white">
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
      <label className="text-sm font-semibold text-white" htmlFor={id}>
        {label}
      </label>
      <input
        className="min-h-11 w-full rounded-md border border-blue-300 bg-slate-500 px-3 py-2.5 text-white placeholder:text-white focus:border-blue-600 focus:outline-3 focus:outline-blue-600/20"
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
    <p className="mt-6 text-center text-sm text-white [&_a]:font-semibold [&_a]:text-black [&_a]:hover:underline">
      {children}
    </p>
  );
}

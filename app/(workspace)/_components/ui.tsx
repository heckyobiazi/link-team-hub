import { statusLabels, statusStyles, type Status } from "@/lib/sample-data";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-5">
      {title && <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>}
      {children}
    </section>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <progress
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-blue-500 [&::-webkit-progress-bar]:bg-slate-500/30 [&::-webkit-progress-value]:bg-blue-500"
      max={100}
      value={value}
    />
  );
}

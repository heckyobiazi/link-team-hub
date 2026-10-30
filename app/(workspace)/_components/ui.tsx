import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { workStatusEnum } from "@/lib/db/schema";

type Status = (typeof workStatusEnum.enumValues)[number];

const statusStyles: Record<Status, string> = {
  todo: "bg-slate-500/20 text-slate-300",
  "in-progress": "bg-blue-500/20 text-blue-300",
  blocked: "bg-red-500/20 text-red-300",
  done: "bg-emerald-500/20 text-emerald-300",
};

const statusLabels: Record<Status, string> = {
  todo: "To do",
  "in-progress": "In progress",
  blocked: "Blocked",
  done: "Done",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={`h-auto border-0 ${statusStyles[status]}`} variant="outline">
      {statusLabels[status]}
    </Badge>
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
    <Card className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-5 text-slate-200">
      {title && <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
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

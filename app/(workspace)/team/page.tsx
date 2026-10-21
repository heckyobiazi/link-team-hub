import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { members } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Team" };

const dot = {
  Available: "bg-emerald-400",
  "In a meeting": "bg-amber-400",
  Away: "bg-slate-500",
} as const;

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Know who is on the team and what they own."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <Panel key={m.id}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-300"
              >
                {m.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">{m.name}</h2>
                <p className="text-xs text-slate-400">
                  {m.role} · {m.focus}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <span aria-hidden className={`size-2 rounded-full ${dot[m.availability]}`} />
              {m.availability}
            </p>
          </Panel>
        ))}
      </div>
    </>
  );
}

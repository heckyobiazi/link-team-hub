import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { Panel, ProgressBar, StatusBadge } from "../_components/ui";
import { memberName, projects, tasks } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Ownership, progress and deadlines for every project."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const count = tasks.filter((t) => t.project === p.id).length;

          return (
            <Panel key={p.id}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{p.name}</h2>
                  <p className="text-xs text-slate-400">
                    {memberName(p.owner)} · Due {p.due} · {count} tasks
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <ProgressBar label={`${p.name} progress`} value={p.progress} />
              <p className="mt-2 text-xs text-slate-400">{p.progress}% complete</p>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

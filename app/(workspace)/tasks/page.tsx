import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { StatusBadge } from "../_components/ui";
import { memberName, projectName, tasks } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Keep ownership, progress and blockers together."
      />
      <div className="overflow-x-auto rounded-xl border border-slate-500/20">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="bg-slate-500/10 text-xs text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">Task</th>
              <th className="px-4 py-3 font-medium" scope="col">Project</th>
              <th className="px-4 py-3 font-medium" scope="col">Assignee</th>
              <th className="px-4 py-3 font-medium" scope="col">Due</th>
              <th className="px-4 py-3 font-medium" scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/20">
            {tasks.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-white">{t.title}</td>
                <td className="px-4 py-3">{projectName(t.project)}</td>
                <td className="px-4 py-3">{memberName(t.assignee)}</td>
                <td className="px-4 py-3">{t.due}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

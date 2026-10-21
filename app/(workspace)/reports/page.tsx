import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { memberName, reports } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="What moved forward, what is next and where help is needed."
      />
      <div className="grid gap-4">
        {reports.map((r) => (
          <Panel key={r.id}>
            <header className="mb-3 flex justify-between text-sm">
              <h2 className="font-semibold text-white">{memberName(r.author)}</h2>
              <time className="text-slate-400">{r.date}</time>
            </header>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-400">Done</dt>
                <dd>{r.done}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Next</dt>
                <dd>{r.next}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Blockers</dt>
                <dd className={r.blockers === "None" ? "" : "text-red-300"}>
                  {r.blockers}
                </dd>
              </div>
            </dl>
          </Panel>
        ))}
      </div>
    </>
  );
}

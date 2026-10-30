import type { Metadata } from "next";
import { Suspense } from "react";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports, teamMembers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { DeleteReportButton, ReportForm } from "../_components/report-form";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Reports" };

async function ReportsContent() {
  const user = await getCurrentUser();
  const rows = await db
    .select({
      id: reports.id,
      reportDate: reports.reportDate,
      completed: reports.completed,
      nextSteps: reports.nextSteps,
      blockers: reports.blockers,
      status: reports.status,
      authorId: reports.authorId,
      authorName: teamMembers.name,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .innerJoin(teamMembers, eq(reports.authorId, teamMembers.id))
    .where(or(eq(reports.status, "submitted"), eq(reports.authorId, user.id)))
    .orderBy(desc(reports.reportDate), desc(reports.updatedAt));

  return (
    <>
      <PageHeader title="Reports" description="Save a draft, then submit your update to the team." />
      <Panel title="Write a report">
        <ReportForm />
      </Panel>
      <section className="mt-6 grid gap-4">
        <h2 className="text-lg font-semibold text-white">Team reports</h2>
        {rows.length ? rows.map((report) => (
          <Panel key={report.id}>
            <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{report.authorName}{report.authorId === user.id ? " (you)" : ""}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {report.reportDate} · <span className="capitalize">{report.status}</span>
                </p>
              </div>
              {report.authorId === user.id && (
                <div className="flex items-center gap-2">
                  <details className="relative">
                    <summary className="cursor-pointer rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5">Edit</summary>
                    <div className="absolute right-0 z-10 mt-2 w-[min(92vw,36rem)] rounded-xl border border-white/10 bg-slate-950 p-4 shadow-xl">
                      <ReportForm report={report} />
                    </div>
                  </details>
                  <DeleteReportButton id={report.id} />
                </div>
              )}
            </header>
            <dl className="grid gap-4 text-sm md:grid-cols-3">
              <div><dt className="mb-1 text-xs text-slate-400">Completed</dt><dd className="whitespace-pre-wrap text-slate-200">{report.completed}</dd></div>
              <div><dt className="mb-1 text-xs text-slate-400">Next steps</dt><dd className="whitespace-pre-wrap text-slate-200">{report.nextSteps}</dd></div>
              <div><dt className="mb-1 text-xs text-slate-400">Blockers</dt><dd className="whitespace-pre-wrap text-slate-200">{report.blockers || "None reported"}</dd></div>
            </dl>
          </Panel>
        )) : <Panel><p className="text-sm text-slate-400">No reports yet. Submit the first team update.</p></Panel>}
      </section>
    </>
  );
}

export default function ReportsPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><ReportsContent /></Suspense>;
}

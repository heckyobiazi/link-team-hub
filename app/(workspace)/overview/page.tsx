import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, reports, tasks, teamMembers } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Management Overview" };

async function OverviewContent() {
  await requireRole(["lead", "executive", "admin"]);
  const [memberRows, projectCount, taskCount, blockedCount, recentReports] = await Promise.all([
    db.select({ id: teamMembers.id, name: teamMembers.name, jobTitle: teamMembers.jobTitle, role: teamMembers.role }).from(teamMembers).where(eq(teamMembers.isActive, true)).orderBy(teamMembers.name),
    db.select({ total: count() }).from(projects),
    db.select({ total: count() }).from(tasks),
    db.select({ total: count() }).from(tasks).where(eq(tasks.status, "blocked")),
    db
      .select({ id: reports.id, authorName: teamMembers.name, reportDate: reports.reportDate, completed: reports.completed })
      .from(reports)
      .innerJoin(teamMembers, eq(reports.authorId, teamMembers.id))
      .where(eq(reports.status, "submitted"))
      .orderBy(desc(reports.submittedAt))
      .limit(5),
  ]);

  return (
    <>
      <PageHeader title="Management Overview" description="Current team, project, task, and report data." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active members", memberRows.length],
          ["Projects", projectCount[0].total],
          ["Tasks", taskCount[0].total],
          ["Blocked tasks", blockedCount[0].total],
        ].map(([label, value]) => (
          <Panel key={label}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-semibold text-white">{value}</p></Panel>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="Team access">
          <ul className="grid gap-3">
            {memberRows.length ? memberRows.map((member) => (
              <li className="flex justify-between gap-3 border-b border-white/10 pb-3 last:border-0" key={member.id}>
                <span><span className="block text-sm text-white">{member.name}</span><span className="text-xs text-slate-400">{member.jobTitle || "Team member"}</span></span>
                <span className="self-center rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">{member.role}</span>
              </li>
            )) : <li className="text-sm text-slate-400">No active members yet.</li>}
          </ul>
          <Link className="mt-4 inline-block text-xs text-cyan-300 hover:underline" href="/team">Manage team →</Link>
        </Panel>
        <Panel title="Recent reports">
          <ul className="grid gap-4">
            {recentReports.length ? recentReports.map((report) => (
              <li className="border-b border-white/10 pb-3 last:border-0" key={report.id}>
                <p className="flex justify-between gap-3 text-sm font-medium text-white"><span>{report.authorName}</span><span className="text-xs text-slate-400">{report.reportDate}</span></p>
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-slate-300">{report.completed}</p>
              </li>
            )) : <li className="text-sm text-slate-400">No reports have been submitted.</li>}
          </ul>
          <Link className="mt-4 inline-block text-xs text-cyan-300 hover:underline" href="/reports">View reports →</Link>
        </Panel>
      </div>
    </>
  );
}

export default function OverviewPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><OverviewContent /></Suspense>;
}

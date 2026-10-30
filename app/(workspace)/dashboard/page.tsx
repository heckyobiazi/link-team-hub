import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { AlertCircle, CheckCircle2, FileCheck2, Users } from "lucide-react";
import { db } from "@/lib/db";
import { projects, reports, tasks, teamMembers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { Panel } from "../_components/ui";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardContent() {
  const user = await getCurrentUser();
  const today = new Date().toISOString().slice(0, 10);
  const [activeCount, submittedToday, taskCount, doneCount, blockedCount, updates, availability, projectRows, projectTaskRows, blockers] = await Promise.all([
    db.select({ total: count() }).from(teamMembers).where(eq(teamMembers.isActive, true)),
    db.select({ total: count() }).from(reports).where(and(eq(reports.reportDate, today), eq(reports.status, "submitted"))),
    db.select({ total: count() }).from(tasks),
    db.select({ total: count() }).from(tasks).where(eq(tasks.status, "done")),
    db.select({ total: count() }).from(tasks).where(eq(tasks.status, "blocked")),
    db
      .select({ id: reports.id, authorName: teamMembers.name, authorTitle: teamMembers.jobTitle, reportDate: reports.reportDate, completed: reports.completed, blockers: reports.blockers })
      .from(reports)
      .innerJoin(teamMembers, eq(reports.authorId, teamMembers.id))
      .where(eq(reports.status, "submitted"))
      .orderBy(desc(reports.submittedAt))
      .limit(4),
    db
      .select({ id: teamMembers.id, name: teamMembers.name, jobTitle: teamMembers.jobTitle, availability: teamMembers.availability })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(teamMembers.name)
      .limit(6),
    db
      .select({ id: projects.id, name: projects.name, progress: projects.progress, ownerName: teamMembers.name })
      .from(projects)
      .leftJoin(teamMembers, eq(projects.ownerId, teamMembers.id))
      .orderBy(desc(projects.updatedAt))
      .limit(4),
    db.select({ projectId: tasks.projectId, status: tasks.status }).from(tasks),
    db
      .select({ id: tasks.id, title: tasks.title, projectName: projects.name, assigneeName: teamMembers.name, description: tasks.description })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(teamMembers, eq(tasks.assigneeId, teamMembers.id))
      .where(eq(tasks.status, "blocked"))
      .orderBy(desc(tasks.updatedAt))
      .limit(4),
  ]);

  const stats = [
    { label: "Active team members", value: activeCount[0].total, note: "Current workspace members", icon: Users },
    { label: "Reports submitted today", value: submittedToday[0].total, note: "Shared team updates", icon: FileCheck2 },
    { label: "Tasks completed", value: doneCount[0].total, note: `Across ${taskCount[0].total} tasks`, icon: CheckCircle2 },
    { label: "Open blockers", value: blockedCount[0].total, note: "Tasks marked blocked", icon: AlertCircle },
  ];
  const availableCount = availability.filter((member) => member.availability === "available").length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-base text-white">Here&apos;s your team&apos;s pulse for today.</h1>
          <p className="mt-3 text-xs text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Link className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none" href="/reports">Write a report</Link>
      </div>

      <section aria-label="Summary" className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article className="rounded-lg bg-white p-5 text-slate-900 shadow-lg shadow-blue-600/10" key={label}>
            <div className="flex items-center justify-between text-xs text-slate-500">{label}<Icon aria-hidden className="size-4 text-blue-600" /></div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-blue-950">{value}</p>
            <p className="mt-3 text-xs text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <Panel title="Latest team reports">
          {updates.length ? (
            <ul className="divide-y divide-white/10">
              {updates.map((report) => (
                <li className="py-4 first:pt-0 last:pb-0" key={report.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-semibold text-white">{report.authorName}</p><p className="text-xs text-slate-400">{report.authorTitle || "Team member"} · {report.reportDate}</p></div>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-200">{report.completed}</p>
                  {report.blockers && <p className="mt-2 text-xs text-amber-200">Blocker: {report.blockers}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-400">No submitted reports yet. Be the first to share an update.</p>}
          <Link className="mt-4 inline-block text-xs font-medium text-cyan-300 hover:underline" href="/reports">View all reports →</Link>
        </Panel>

        <Panel title="Team availability">
          <p className="text-xs text-slate-400">{availableCount} available among the {availability.length} members shown</p>
          <ul className="mt-4 grid gap-3">
            {availability.map((member) => (
              <li className="flex items-center gap-3 text-sm" key={member.id}>
                <span aria-hidden className="grid size-8 place-items-center rounded-full bg-white text-[10px] font-bold text-blue-700">{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
                <span className="flex-1 text-slate-100">{member.name}{member.id === user.id ? " (you)" : ""}</span>
                <span className="text-xs capitalize text-slate-400">{member.availability.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
          <Link className="mt-4 inline-block text-xs text-cyan-300 hover:underline" href="/availability">Update my status →</Link>
        </Panel>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <Panel title="Project progress">
          {projectRows.length ? <ul className="divide-y divide-white/10">
            {projectRows.map((project) => {
              const projectTasks = projectTaskRows.filter((task) => task.projectId === project.id);
              const progress = projectTasks.length
                ? Math.round((projectTasks.filter((task) => task.status === "done").length / projectTasks.length) * 100)
                : project.progress;
              return (
                <li className="py-4 first:pt-0 last:pb-0" key={project.id}>
                  <p className="flex justify-between text-sm font-semibold text-white"><span>{project.name}</span><span>{progress}%</span></p>
                  <progress aria-label={`${project.name} progress`} className="mt-3 h-1 w-full [&::-moz-progress-bar]:bg-blue-600 [&::-webkit-progress-bar]:bg-white/15 [&::-webkit-progress-value]:bg-blue-600" max={100} value={progress} />
                  <p className="mt-2 text-xs text-slate-400">Owner: {project.ownerName || "Unassigned"}</p>
                </li>
              );
            })}
          </ul> : <p className="text-sm text-slate-400">No projects yet.</p>}
          <Link className="mt-4 inline-block text-xs text-cyan-300 hover:underline" href="/projects">View projects →</Link>
        </Panel>

        <Panel title="Blockers needing attention">
          {blockers.length ? <ul className="divide-y divide-white/10">
            {blockers.map((task) => (
              <li className="py-4 first:pt-0 last:pb-0" key={task.id}>
                <p className="text-sm font-semibold text-white">{task.title}</p>
                <p className="mt-1 text-xs text-slate-400">{task.projectName} · {task.assigneeName || "Unassigned"}</p>
                {task.description && <p className="mt-2 text-sm text-slate-300">{task.description}</p>}
              </li>
            ))}
          </ul> : <p className="text-sm text-slate-400">There are no blocked tasks.</p>}
          <Link className="mt-4 inline-block text-xs text-cyan-300 hover:underline" href="/tasks">View tasks →</Link>
        </Panel>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><DashboardContent /></Suspense>;
}

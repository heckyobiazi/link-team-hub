import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, tasks, teamMembers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel, ProgressBar, StatusBadge } from "../_components/ui";
import { ProjectForm } from "../_components/project-task-forms";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Projects" };

async function ProjectsContent() {
  const user = await getCurrentUser();
  const [rows, taskRows] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        dueDate: projects.dueDate,
        status: projects.status,
        progress: projects.progress,
        ownerName: teamMembers.name,
      })
      .from(projects)
      .leftJoin(teamMembers, eq(projects.ownerId, teamMembers.id))
      .orderBy(projects.name),
    db.select({ projectId: tasks.projectId, status: tasks.status }).from(tasks),
  ]);
  const canCreate = user.role === "admin" || user.role === "lead";

  return (
    <>
      <PageHeader title="Projects" description="Projects and progress from your workspace data." />
      {canCreate && <Panel title="Create a project"><ProjectForm /></Panel>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {rows.length ? rows.map((project) => {
          const projectTasks = taskRows.filter((task) => task.projectId === project.id);
          const doneCount = projectTasks.filter((task) => task.status === "done").length;
          const progress = projectTasks.length
            ? Math.round((doneCount / projectTasks.length) * 100)
            : project.progress;
          const status = projectTasks.some((task) => task.status === "blocked")
            ? "blocked"
            : projectTasks.length > 0 && doneCount === projectTasks.length
              ? "done"
              : projectTasks.some((task) => task.status === "in-progress" || task.status === "done")
                ? "in-progress"
                : project.status;
          return (
            <Panel key={project.id}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{project.name}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {project.ownerName ? `Owner: ${project.ownerName}` : "No owner"} · {project.dueDate ? `Due ${project.dueDate}` : "No due date"} · {projectTasks.length} tasks
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>
              {project.description && <p className="mb-4 text-sm text-slate-300">{project.description}</p>}
              <ProgressBar label={`${project.name} progress`} value={progress} />
              <p className="mt-2 text-xs text-slate-400">{progress}% complete</p>
            </Panel>
          );
        }) : <Panel><p className="text-sm text-slate-400">No projects yet. {canCreate ? "Create a project to get started." : "Your team’s projects will appear here."}</p></Panel>}
      </div>
    </>
  );
}

export default function ProjectsPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><ProjectsContent /></Suspense>;
}

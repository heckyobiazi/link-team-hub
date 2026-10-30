import type { Metadata } from "next";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, tasks, teamMembers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { TaskForm, TaskStatusSelect } from "../_components/project-task-forms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Tasks" };

async function TasksContent() {
  const user = await getCurrentUser();
  const canAssign = user.role === "admin" || user.role === "lead";
  const [taskRows, projectRows, memberRows] = await Promise.all([
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        status: tasks.status,
        assigneeId: tasks.assigneeId,
        createdById: tasks.createdById,
        projectName: projects.name,
        assigneeName: teamMembers.name,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(teamMembers, eq(tasks.assigneeId, teamMembers.id))
      .orderBy(desc(tasks.createdAt)),
    db.select({ id: projects.id, name: projects.name }).from(projects).orderBy(projects.name),
    db
      .select({ id: teamMembers.id, name: teamMembers.name })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(teamMembers.name),
  ]);

  return (
    <>
      <PageHeader title="Tasks" description="Assignments and progress for the team." />
      {canAssign && (
        <Panel title="Assign a task">
          <TaskForm key={`${projectRows.map((project) => project.id).join(":")}-${memberRows.map((member) => member.id).join(":")}`} projects={projectRows} members={memberRows} />
        </Panel>
      )}
      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-white">All tasks</h2>
        {taskRows.length ? (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <Table className="min-w-[760px] text-left text-sm">
              <TableHeader className="bg-white/5 text-xs text-slate-400">
                <TableRow>
                  <TableHead scope="col">Task</TableHead>
                  <TableHead scope="col">Project</TableHead>
                  <TableHead scope="col">Assignee</TableHead>
                  <TableHead scope="col">Due</TableHead>
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/10">
                {taskRows.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="px-4 py-3 whitespace-normal text-white">
                      <span className="block font-medium">{task.title}</span>
                      {task.description && <span className="mt-1 block max-w-md text-xs text-slate-400">{task.description}</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-300">{task.projectName}</TableCell>
                    <TableCell className="px-4 py-3 text-slate-300">{task.assigneeName ?? "Unassigned"}</TableCell>
                    <TableCell className="px-4 py-3 text-slate-300">{task.dueDate || "—"}</TableCell>
                    <TableCell className="px-4 py-3">
                      {task.assigneeId === user.id || canAssign ? (
                        <TaskStatusSelect id={task.id} status={task.status} />
                      ) : (
                        <span className="text-xs capitalize text-slate-300">{task.status.replace("-", " ")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Panel><p className="text-sm text-slate-400">No tasks yet. {canAssign ? "Create a project, then assign the first task." : "Your team’s tasks will appear here."}</p></Panel>
        )}
      </section>
    </>
  );
}

export default function TasksPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><TasksContent /></Suspense>;
}

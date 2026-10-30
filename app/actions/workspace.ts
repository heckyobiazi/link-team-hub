"use server";

import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  auditLogs,
  calendarEvents,
  notifications,
  projects,
  reports,
  tasks,
  teamMembers,
} from "@/lib/db/schema";
import { protectedActionClient } from "@/lib/safe-action";

async function logActivity(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string,
) {
  await db.insert(auditLogs).values({
    actorId,
    action,
    entityType,
    entityId: entityId ?? null,
  });
}

const reportInput = z.object({
  id: z.string().uuid().optional(),
  reportDate: z.iso.date(),
  completed: z.string().trim().min(1).max(5000),
  nextSteps: z.string().trim().min(1).max(5000),
  blockers: z.string().trim().max(3000).optional(),
  submit: z.boolean().default(false),
});

async function notify(
  recipients: string[],
  actorId: string,
  type: string,
  title: string,
  message: string,
  href: string,
) {
  const uniqueRecipients = [...new Set(recipients)].filter((id) => id !== actorId);
  if (!uniqueRecipients.length) return;
  await db.insert(notifications).values(
    uniqueRecipients.map((recipientId) => ({
      recipientId,
      actorId,
      type,
      title,
      message,
      href,
    })),
  );
  revalidatePath("/dashboard", "layout");
}

async function managementRecipients(actorId: string) {
  const rows = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(
      and(
        inArray(teamMembers.role, ["admin", "executive", "lead"]),
        eq(teamMembers.isActive, true),
        ne(teamMembers.id, actorId),
      ),
    );
  return rows.map((row) => row.id);
}

export const saveReport = protectedActionClient
  .inputSchema(reportInput)
  .action(async ({ parsedInput, ctx }) => {
    const { id, submit, ...fields } = parsedInput;
    const now = new Date();
    const values = {
      reportDate: fields.reportDate,
      completed: fields.completed,
      nextSteps: fields.nextSteps,
      blockers: fields.blockers || null,
      status: submit ? ("submitted" as const) : ("draft" as const),
      submittedAt: submit ? now : null,
      updatedAt: now,
    };

    let report;
    if (id) {
      [report] = await db
        .update(reports)
        .set(values)
        .where(and(eq(reports.id, id), eq(reports.authorId, ctx.user.id)))
        .returning({ id: reports.id });
      if (!report) throw new Error("Report not found or not yours");
    } else {
      [report] = await db
        .insert(reports)
        .values({ ...values, authorId: ctx.user.id })
        .returning({ id: reports.id });
    }

    const sideEffects = [
      logActivity(
        ctx.user.id,
        submit ? "report.submitted" : id ? "report.updated" : "report.created",
        "report",
        report.id,
      ),
    ];
    if (submit) {
      sideEffects.push(
        managementRecipients(ctx.user.id).then((recipients) =>
          notify(
            recipients,
            ctx.user.id,
            "report_submitted",
            "A team report was submitted",
            `${ctx.user.name} submitted a report for ${fields.reportDate}.`,
            "/reports",
          ),
        ),
      );
    }
    await Promise.all(sideEffects);

    revalidatePath("/reports");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    return { success: true, reportId: report.id };
  });

export const deleteReport = protectedActionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const [deleted] = await db
      .delete(reports)
      .where(
        and(
          eq(reports.id, parsedInput.id),
          eq(reports.authorId, ctx.user.id),
        ),
      )
      .returning({ id: reports.id });
    if (!deleted) throw new Error("Report not found or not yours");
    await logActivity(ctx.user.id, "report.deleted", "report", deleted.id);
    revalidatePath("/reports");
    revalidatePath("/dashboard");
    return { success: true };
  });

export const createProject = protectedActionClient
  .inputSchema(
    z.object({
      name: z.string().trim().min(1).max(180),
      description: z.string().trim().max(3000).optional(),
      dueDate: z.union([z.literal(""), z.iso.date()]).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (!["admin", "lead"].includes(ctx.user.role)) {
      throw new Error("Only admins and team leads can create projects");
    }
    const [project] = await db
      .insert(projects)
      .values({
        name: parsedInput.name,
        description: parsedInput.description || null,
        dueDate: parsedInput.dueDate || null,
        ownerId: ctx.user.id,
      })
      .returning({ id: projects.id });
    const members = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true));
    await Promise.all([
      logActivity(ctx.user.id, "project.created", "project", project.id),
      notify(
        members.map((member) => member.id),
        ctx.user.id,
        "project_created",
        "A project was created",
        `${ctx.user.name} created the project “${parsedInput.name}”.`,
        "/projects",
      ),
    ]);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    return { success: true, projectId: project.id };
  });

export const createTask = protectedActionClient
  .inputSchema(
    z.object({
      title: z.string().trim().min(1).max(240),
      description: z.string().trim().max(3000).optional(),
      projectId: z.string().uuid(),
      assigneeId: z.string().uuid(),
      dueDate: z.union([z.literal(""), z.iso.date()]).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (!["admin", "lead"].includes(ctx.user.role)) {
      throw new Error("Only admins and team leads can assign tasks");
    }

    const [assignee] = await db
      .select({ id: teamMembers.id, name: teamMembers.name })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.id, parsedInput.assigneeId),
          eq(teamMembers.isActive, true),
        ),
      )
      .limit(1);
    if (!assignee) throw new Error("Choose an active team member");

    const [task] = await db
      .insert(tasks)
      .values({
        title: parsedInput.title,
        description: parsedInput.description || null,
        projectId: parsedInput.projectId,
        assigneeId: assignee.id,
        createdById: ctx.user.id,
        dueDate: parsedInput.dueDate || null,
      })
      .returning({ id: tasks.id });

    await Promise.all([
      logActivity(ctx.user.id, "task.assigned", "task", task.id),
      notify(
        [assignee.id],
        ctx.user.id,
        "task_assigned",
        "You were assigned a task",
        `${ctx.user.name} assigned you: ${parsedInput.title}`,
        "/tasks",
      ),
    ]);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    return { success: true, taskId: task.id };
  });

export const updateTaskStatus = protectedActionClient
  .inputSchema(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["todo", "in-progress", "blocked", "done"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parsedInput.id))
      .limit(1);
    if (!task) throw new Error("Task not found");

    const canManage = ["admin", "lead"].includes(ctx.user.role);
    if (task.assigneeId !== ctx.user.id && !canManage) {
      throw new Error("You cannot update this task");
    }

    await db
      .update(tasks)
      .set({ status: parsedInput.status, updatedAt: new Date() })
      .where(eq(tasks.id, task.id));
    const sideEffects = [
      logActivity(ctx.user.id, "task.status_updated", "task", task.id),
    ];
    if (task.createdById) {
      sideEffects.push(
        notify(
          [task.createdById],
          ctx.user.id,
          "task_updated",
          "A task was updated",
          `${ctx.user.name} changed “${task.title}” to ${parsedInput.status}.`,
          "/tasks",
        ),
      );
    }
    await Promise.all(sideEffects);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    return { success: true };
  });

export const saveMemberProfile = protectedActionClient
  .inputSchema(
    z.object({
      jobTitle: z.string().trim().min(1).max(120),
      focus: z.string().trim().max(120).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await Promise.all([
      db
        .update(teamMembers)
        .set({
          jobTitle: parsedInput.jobTitle,
          focus: parsedInput.focus || null,
          updatedAt: new Date(),
        })
        .where(eq(teamMembers.id, ctx.user.id)),
      logActivity(ctx.user.id, "member.profile_updated", "team_member", ctx.user.id),
    ]);
    revalidatePath("/team");
    revalidatePath("/dashboard");
    revalidatePath("/messages");
    revalidatePath("/onboarding");
    return { success: true };
  });

export const updateAvailability = protectedActionClient
  .inputSchema(
    z.object({ availability: z.enum(["available", "in_meeting", "away"]) }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await Promise.all([
      db
        .update(teamMembers)
        .set({ availability: parsedInput.availability, updatedAt: new Date() })
        .where(eq(teamMembers.id, ctx.user.id)),
      logActivity(ctx.user.id, "member.availability_updated", "team_member", ctx.user.id),
    ]);
    revalidatePath("/availability");
    revalidatePath("/team");
    revalidatePath("/dashboard");
    return { success: true };
  });

export const updateMemberRole = protectedActionClient
  .inputSchema(
    z.object({
      memberId: z.string().uuid(),
      role: z.enum(["member", "lead", "executive", "admin"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admin access required");
    if (parsedInput.memberId === ctx.user.id && parsedInput.role !== "admin") {
      throw new Error("You cannot remove your own admin access");
    }

    const [updated] = await db
      .update(teamMembers)
      .set({ role: parsedInput.role, updatedAt: new Date() })
      .where(eq(teamMembers.id, parsedInput.memberId))
      .returning({ id: teamMembers.id });
    if (!updated) throw new Error("Team member not found");
    await Promise.all([
      logActivity(ctx.user.id, "member.role_updated", "team_member", updated.id),
      notify(
        [updated.id],
        ctx.user.id,
        "access_updated",
        "Your workspace access changed",
        `${ctx.user.name} changed your access level to ${parsedInput.role}.`,
        "/team",
      ),
    ]);
    revalidatePath("/team");
    revalidatePath("/settings");
    revalidatePath("/notifications");
    return { success: true };
  });

export const createCalendarEvent = protectedActionClient
  .inputSchema(
    z
      .object({
        title: z.string().trim().min(1).max(180),
        description: z.string().trim().max(2000).optional(),
        type: z.enum(["meeting", "review", "deadline"]),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime().optional(),
        meetingUrl: z.union([z.literal(""), z.string().url()]).optional(),
      })
      .refine(
        (event) =>
          !event.endsAt || new Date(event.endsAt) >= new Date(event.startsAt),
        { message: "The end time must be after the start time", path: ["endsAt"] },
      ),
  )
  .action(async ({ parsedInput, ctx }) => {
    const [event] = await db
      .insert(calendarEvents)
      .values({
        title: parsedInput.title,
        description: parsedInput.description || null,
        type: parsedInput.type,
        startsAt: new Date(parsedInput.startsAt),
        endsAt: parsedInput.endsAt ? new Date(parsedInput.endsAt) : null,
        meetingUrl: parsedInput.meetingUrl || null,
        createdById: ctx.user.id,
      })
      .returning({ id: calendarEvents.id });
    const [members] = await Promise.all([
      db
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(eq(teamMembers.isActive, true)),
      logActivity(ctx.user.id, "calendar_event.created", "calendar_event", event.id),
    ]);
    await notify(
      members.map((member) => member.id),
      ctx.user.id,
      "calendar_event",
      "A calendar event was added",
      `${ctx.user.name} added “${parsedInput.title}” to the calendar.`,
      "/calendar",
    );
    revalidatePath("/calendar");
    revalidatePath("/meeting");
    revalidatePath("/notifications");
    return { success: true, eventId: event.id };
  });

export const markNotificationRead = protectedActionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await Promise.all([
      db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notifications.id, parsedInput.id),
            eq(notifications.recipientId, ctx.user.id),
          ),
        ),
      logActivity(ctx.user.id, "notification.read", "notification", parsedInput.id),
    ]);
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    return { success: true };
  });

export const markAllNotificationsRead = protectedActionClient
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    await Promise.all([
      db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notifications.recipientId, ctx.user.id),
            isNull(notifications.readAt),
          ),
        ),
      logActivity(ctx.user.id, "notifications.marked_read", "notification"),
    ]);
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    return { success: true };
  });


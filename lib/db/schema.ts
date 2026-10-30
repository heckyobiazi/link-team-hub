import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const memberRoleEnum = pgEnum("member_role", [
  "admin",
  "executive",
  "lead",
  "member",
]);

export const memberAvailabilityEnum = pgEnum("member_availability", [
  "available",
  "in_meeting",
  "away",
]);

export const workStatusEnum = pgEnum("work_status", [
  "todo",
  "in-progress",
  "blocked",
  "done",
]);

export const calendarEventTypeEnum = pgEnum("calendar_event_type", [
  "meeting",
  "review",
  "deadline",
]);

export const reportStatusEnum = pgEnum("report_status", ["draft", "submitted"]);

export const conversationKindEnum = pgEnum("conversation_kind", [
  "direct",
  "section",
  "group",
]);

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kindeUserId: varchar("kinde_user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    jobTitle: varchar("job_title", { length: 120 }),
    role: memberRoleEnum("role").default("member").notNull(),
    focus: varchar("focus", { length: 120 }),
    availability: memberAvailabilityEnum("availability")
      .default("available")
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("team_members_kinde_user_id_uidx").on(table.kindeUserId),
    uniqueIndex("team_members_email_uidx").on(table.email),
    index("team_members_role_idx").on(table.role),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    description: text("description"),
    ownerId: uuid("owner_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    progress: integer("progress").default(0).notNull(),
    dueDate: date("due_date"),
    status: workStatusEnum("status").default("todo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "projects_progress_range",
      sql`${table.progress} >= 0 AND ${table.progress} <= 100`,
    ),
    index("projects_owner_id_idx").on(table.ownerId),
    index("projects_status_due_date_idx").on(table.status, table.dueDate),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assigneeId: uuid("assignee_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    createdById: uuid("created_by_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    dueDate: date("due_date"),
    status: workStatusEnum("status").default("todo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tasks_project_status_idx").on(table.projectId, table.status),
    index("tasks_assignee_id_idx").on(table.assigneeId),
    index("tasks_due_date_idx").on(table.dueDate),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    reportDate: date("report_date").notNull(),
    completed: text("completed").notNull(),
    nextSteps: text("next_steps").notNull(),
    blockers: text("blockers"),
    status: reportStatusEnum("status").default("draft").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reports_author_date_idx").on(table.authorId, table.reportDate),
    index("reports_report_date_idx").on(table.reportDate),
  ],
);

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    type: calendarEventTypeEnum("type").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    meetingUrl: varchar("meeting_url", { length: 2048 }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    createdById: uuid("created_by_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "calendar_events_end_after_start",
      sql`${table.endsAt} IS NULL OR ${table.endsAt} >= ${table.startsAt}`,
    ),
    index("calendar_events_starts_at_idx").on(table.startsAt),
    index("calendar_events_project_id_idx").on(table.projectId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    type: varchar("type", { length: 40 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    message: text("message").notNull(),
    href: varchar("href", { length: 255 }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_recipient_created_idx").on(
      table.recipientId,
      table.createdAt,
    ),
    index("notifications_recipient_read_idx").on(
      table.recipientId,
      table.readAt,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_actor_created_idx").on(table.actorId, table.createdAt),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: conversationKindEnum("kind").notNull(),
    name: varchar("name", { length: 120 }),
    sectionKey: varchar("section_key", { length: 160 }),
    directKey: varchar("direct_key", { length: 80 }),
    createdById: uuid("created_by_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("conversations_section_key_uidx").on(table.sectionKey),
    uniqueIndex("conversations_direct_key_uidx").on(table.directKey),
    index("conversations_kind_updated_idx").on(table.kind, table.updatedAt),
  ],
);

export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.memberId] }),
    index("conversation_members_member_idx").on(table.memberId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "messages_body_length_check",
      sql`char_length(${table.body}) BETWEEN 1 AND 2000`,
    ),
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

export const calendarEventAttendees = pgTable(
  "calendar_event_attendees",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => calendarEvents.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.memberId] }),
    index("calendar_event_attendees_member_id_idx").on(table.memberId),
  ],
);

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type ConversationMember = typeof conversationMembers.$inferSelect;
export type Message = typeof messages.$inferSelect;

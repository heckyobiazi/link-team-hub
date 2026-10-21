CREATE TYPE "public"."calendar_event_type" AS ENUM('meeting', 'review', 'deadline');--> statement-breakpoint
CREATE TYPE "public"."member_availability" AS ENUM('available', 'in_meeting', 'away');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('admin', 'executive', 'lead', 'member');--> statement-breakpoint
CREATE TYPE "public"."work_status" AS ENUM('todo', 'in-progress', 'blocked', 'done');--> statement-breakpoint
CREATE TABLE "calendar_event_attendees" (
	"event_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	CONSTRAINT "calendar_event_attendees_event_id_member_id_pk" PRIMARY KEY("event_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text,
	"type" "calendar_event_type" NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"project_id" uuid,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_events_end_after_start" CHECK ("calendar_events"."ends_at" IS NULL OR "calendar_events"."ends_at" >= "calendar_events"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"owner_id" uuid,
	"progress" integer DEFAULT 0 NOT NULL,
	"due_date" date,
	"status" "work_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_progress_range" CHECK ("projects"."progress" >= 0 AND "projects"."progress" <= 100)
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"report_date" date NOT NULL,
	"completed" text NOT NULL,
	"next_steps" text NOT NULL,
	"blockers" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"assignee_id" uuid,
	"title" varchar(240) NOT NULL,
	"description" text,
	"due_date" date,
	"status" "work_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kinde_user_id" varchar(255) NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(320),
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"focus" varchar(120),
	"availability" "member_availability" DEFAULT 'available' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_event_attendees" ADD CONSTRAINT "calendar_event_attendees_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_attendees" ADD CONSTRAINT "calendar_event_attendees_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_id_team_members_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_team_members_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_team_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_team_members_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_event_attendees_member_id_idx" ON "calendar_event_attendees" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "calendar_events_starts_at_idx" ON "calendar_events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "calendar_events_project_id_idx" ON "calendar_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "projects_status_due_date_idx" ON "projects" USING btree ("status","due_date");--> statement-breakpoint
CREATE INDEX "reports_author_date_idx" ON "reports" USING btree ("author_id","report_date");--> statement-breakpoint
CREATE INDEX "reports_report_date_idx" ON "reports" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "tasks_project_status_idx" ON "tasks" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_kinde_user_id_uidx" ON "team_members" USING btree ("kinde_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_email_uidx" ON "team_members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "team_members_role_idx" ON "team_members" USING btree ("role");
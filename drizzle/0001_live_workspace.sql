CREATE TYPE "public"."report_status" AS ENUM ('draft', 'submitted');
--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "job_title" varchar(120);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_by_id" uuid;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_team_members_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "meeting_url" varchar(2048);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "status" "report_status" DEFAULT 'submitted' NOT NULL;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "submitted_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "reports" SET "submitted_at" = "updated_at" WHERE "status" = 'submitted';
--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'draft';
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"actor_id" uuid,
	"type" varchar(40) NOT NULL,
	"title" varchar(180) NOT NULL,
	"message" text NOT NULL,
	"href" varchar(255),
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_team_members_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_team_members_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "notifications_recipient_created_idx" ON "notifications" USING btree ("recipient_id", "created_at");
--> statement-breakpoint
CREATE INDEX "notifications_recipient_read_idx" ON "notifications" USING btree ("recipient_id", "read_at");

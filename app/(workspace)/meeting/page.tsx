import type { Metadata } from "next";
import { Suspense } from "react";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import Link from "next/link";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Meetings" };

async function MeetingContent() {
  const meetings = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.type, "meeting"), isNotNull(calendarEvents.meetingUrl)))
    .orderBy(asc(calendarEvents.startsAt));

  return (
    <>
      <PageHeader title="Meetings" description="Join the meetings saved in your team calendar." />
      <div className="grid gap-3">
        {meetings.length ? meetings.map((meeting) => (
          <Panel key={meeting.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">{meeting.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{new Date(meeting.startsAt).toLocaleString()}</p>
                {meeting.description && <p className="mt-2 text-sm text-slate-300">{meeting.description}</p>}
              </div>
              <a className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500" href={meeting.meetingUrl!} rel="noreferrer" target="_blank">Join</a>
            </div>
          </Panel>
        )) : (
          <Panel>
            <p className="text-sm text-slate-400">No meeting links are saved yet. Add a meeting and link from the <Link className="text-cyan-300 hover:underline" href="/calendar">calendar</Link>.</p>
          </Panel>
        )}
      </div>
    </>
  );
}

export default function MeetingPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><MeetingContent /></Suspense>;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { CalendarEventForm } from "../_components/calendar-form";
import LoadingPage from "../../loadingpage";

export const metadata: Metadata = { title: "Calendar" };

const eventStyles = {
  meeting: "border-blue-500/30 bg-blue-500/10",
  review: "border-violet-500/30 bg-violet-500/10",
  deadline: "border-red-500/30 bg-red-500/10",
} as const;

async function CalendarEvents() {
  const events = await db.select().from(calendarEvents).orderBy(asc(calendarEvents.startsAt));

  return (
    <section className="mt-6 grid gap-3">
      <h2 className="text-lg font-semibold text-white">Team calendar</h2>
      {events.length ? events.map((event) => (
        <article className={`rounded-xl border p-4 ${eventStyles[event.type]}`} key={event.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{event.title}</h3>
              <p className="mt-1 text-xs capitalize text-slate-300">{event.type.replace("_", " ")}</p>
            </div>
            <time className="text-sm text-slate-300">{new Date(event.startsAt).toLocaleString()}</time>
          </div>
          {event.description && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{event.description}</p>}
          {event.meetingUrl && <a className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:underline" href={event.meetingUrl} rel="noreferrer" target="_blank">Join meeting</a>}
        </article>
      )) : <Panel><p className="text-sm text-slate-400">No calendar events yet.</p></Panel>}
    </section>
  );
}

export default function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendar" description="Add team meetings, reviews, and deadlines." />
      <Panel title="Add an event"><CalendarEventForm /></Panel>
      <Suspense fallback={<LoadingPage label="Loading calendar…" />}>
        <CalendarEvents />
      </Suspense>
    </>
  );
}

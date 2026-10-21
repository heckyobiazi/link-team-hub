import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { events } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Calendar" };

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const kindStyles = {
  Meeting: "bg-blue-500/20 text-blue-200",
  Review: "bg-violet-500/20 text-violet-200",
  Deadline: "bg-red-500/20 text-red-200",
} as const;

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="See the team rhythm around the work."
      />
      <div className="grid gap-4 md:grid-cols-5">
        {days.map((day) => (
          <section
            className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-3"
            key={day}
          >
            <h2 className="mb-3 text-xs font-semibold text-slate-400">{day}</h2>
            <ul className="grid gap-2">
              {events
                .filter((e) => e.day === day)
                .map((e) => (
                  <li
                    className={`rounded-md px-3 py-2 text-xs ${kindStyles[e.kind]}`}
                    key={e.id}
                  >
                    <p className="font-medium">{e.title}</p>
                    <p className="opacity-70">{e.time}</p>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

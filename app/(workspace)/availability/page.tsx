import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { AvailabilitySelect } from "../_components/member-controls";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Availability" };

const labels = {
  available: "Available",
  in_meeting: "In a meeting",
  away: "Away",
} as const;

async function AvailabilityContent() {
  const user = await getCurrentUser();
  const members = await db
    .select({ id: teamMembers.id, name: teamMembers.name, jobTitle: teamMembers.jobTitle, availability: teamMembers.availability })
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(teamMembers.name);

  return (
    <>
      <PageHeader title="Availability" description="Share when you are available, on your terms." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Panel title="My availability">
          <p className="mb-3 text-sm text-slate-400">This is self-reported and helps teammates coordinate.</p>
          <AvailabilitySelect availability={user.availability} />
        </Panel>
        <Panel title="Team availability">
          {members.length ? (
            <ul className="grid gap-3">
              {members.map((member) => (
                <li className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-0" key={member.id}>
                  <span>
                    <span className="block text-sm text-white">{member.name}{member.id === user.id ? " (you)" : ""}</span>
                    <span className="text-xs text-slate-400">{member.jobTitle || "Team member"}</span>
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300">{labels[member.availability]}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-400">No availability has been shared yet.</p>}
        </Panel>
      </div>
    </>
  );
}

export default function AvailabilityPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><AvailabilityContent /></Suspense>;
}

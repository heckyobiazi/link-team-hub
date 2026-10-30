import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { canInviteTeamMembers, getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { MemberRoleSelect, ProfileSetupForm } from "../_components/member-controls";
import { InviteMemberForm } from "../_components/invite-member-form";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Team" };

const availabilityLabel = {
  available: "Available",
  in_meeting: "In a meeting",
  away: "Away",
} as const;

async function TeamContent() {
  const currentUser = await getCurrentUser();
  const members = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(teamMembers.name);
  const isAdmin = currentUser.role === "admin";
  const canInvite = canInviteTeamMembers(currentUser);

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage your profile and see the people in your workspace."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Panel title="My profile">
          <ProfileSetupForm jobTitle={currentUser.jobTitle ?? ""} focus={currentUser.focus} />
        </Panel>
        <Panel title={`Team members (${members.length})`}>
          {members.length ? (
            <ul className="grid gap-3">
              {members.map((member) => (
                <li className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-3 last:border-0" key={member.id}>
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600/20 text-xs font-semibold text-blue-200">
                    {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-40 flex-1">
                    <p className="text-sm font-medium text-white">{member.name}{member.id === currentUser.id ? " (you)" : ""}</p>
                    <p className="text-xs text-slate-400">
                      {[member.jobTitle, member.focus, availabilityLabel[member.availability]].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {isAdmin ? (
                    <MemberRoleSelect memberId={member.id} role={member.role} disabled={member.id === currentUser.id} />
                  ) : (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">{member.role}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No active team members yet.</p>
          )}
          {isAdmin && <p className="mt-4 text-xs text-slate-400">Access levels are managed by admins. Members choose a job title, not their permission level.</p>}
        </Panel>
      </div>
      {canInvite && (
        <div className="mt-5">
          <Panel title="Invite a team member">
            <InviteMemberForm />
          </Panel>
        </div>
      )}
    </>
  );
}

export default function TeamPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><TeamContent /></Suspense>;
}

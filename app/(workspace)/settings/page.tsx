import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Settings" };

async function SettingsContent() {
  await requireRole(["admin"]);
  const [memberTotal] = await db
    .select({ total: count() })
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true));

  return (
    <>
      <PageHeader title="Settings" description="Manage workspace access and team roles." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Workspace">
          <p className="text-sm text-slate-300">LINK Team Hub</p>
          <p className="mt-2 text-sm text-slate-400">{memberTotal.total} active team members are connected to this workspace.</p>
        </Panel>
        <Panel title="Roles and access">
          <p className="text-sm text-slate-300">New accounts join as members. Admins can grant lead, executive, or admin access from the Team page.</p>
          <Link className="mt-4 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500" href="/team">Manage team roles</Link>
        </Panel>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><SettingsContent /></Suspense>;
}

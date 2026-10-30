import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { MarkAllNotificationsRead, MarkNotificationRead } from "../_components/notification-controls";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";

export const metadata: Metadata = { title: "Notifications" };

async function NotificationsContent() {
  const user = await getCurrentUser();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, user.id))
    .orderBy(desc(notifications.createdAt));
  const hasUnread = rows.some((notification) => !notification.readAt);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Notifications" description="Updates about tasks, reports, and changes in your workspace." />
        {hasUnread && <MarkAllNotificationsRead />}
      </div>
      <div className="grid gap-3">
        {rows.length ? rows.map((notification) => (
          <Panel key={notification.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!notification.readAt && <span aria-label="Unread" className="size-2 rounded-full bg-blue-400" />}
                  <h2 className="font-semibold text-white">{notification.title}</h2>
                </div>
                <p className="mt-2 text-sm text-slate-300">{notification.message}</p>
                <time className="mt-2 block text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</time>
                {notification.href && <Link className="mt-3 inline-block text-sm text-cyan-300 hover:underline" href={notification.href}>Open</Link>}
              </div>
              {!notification.readAt && <MarkNotificationRead id={notification.id} />}
            </div>
          </Panel>
        )) : <Panel><p className="text-sm text-slate-400">You’re all caught up. New team updates will appear here.</p></Panel>}
      </div>
    </>
  );
}

export default function NotificationsPage() {
  return <Suspense fallback={<WorkspacePageFallback />}><NotificationsContent /></Suspense>;
}

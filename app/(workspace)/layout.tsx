import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { getCurrentUser, getUnreadNotificationCount, visibleRoutes } from "@/lib/auth";
import { WorkspaceNav } from "./_components/workspace-nav";
import { WorkspaceTopbar } from "./_components/workspace-topbar";

export const metadata: Metadata = {
  title: {
    default: "Workspace | LINK Team Hub",
    template: "%s | LINK Team Hub",
  },
};

const roleLabels = {
  member: "Team member",
  lead: "Team lead",
  executive: "Executive",
  admin: "Admin",
} as const;

// Reads the signed-in user, so it must render inside a Suspense boundary.
async function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unreadCount = await getUnreadNotificationCount(user.id);
  const routes = visibleRoutes(user.role).map(({ href, label }) => ({ href, label }));

  return (
    <div className="flex min-h-dvh bg-black text-slate-200" data-workspace>
      <aside className="sticky top-0 hidden h-dvh w-62 shrink-0 flex-col gap-6 overflow-y-auto overscroll-contain border-r border-white/15 px-4 py-6 md:flex">
        <Link
          className="flex items-center gap-3 px-1 pt-4 pb-2"
          href="/dashboard">
          <img src="/LINK Logo White.svg" alt="LINK Team Hub" className="h-26 w-26" />
        </Link>

        <WorkspaceNav routes={routes} unreadCount={unreadCount} />

        <div className="mt-auto flex items-center gap-3 border-t border-white/15 pt-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-blue-700">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1 text-xs">
            <p className="truncate font-semibold text-white">{user.name}</p>
            <p className="text-slate-400">{roleLabels[user.role]}</p>
          </div>
          <LogoutLink
            aria-label="Sign out"
            className="text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <LogOut aria-hidden className="size-4" />
          </LogoutLink>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceTopbar initials={user.initials} unreadCount={unreadCount} />
        <main className="flex-1 p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-black" data-workspace />}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </Suspense>
  );
}

"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspaceRoutes } from "@/lib/routes";

export function WorkspaceTopbar({ initials, unreadCount }: { initials: string; unreadCount: number }) {
  const pathname = usePathname();
  const title =
    workspaceRoutes.find((r) => r.href === pathname)?.label ?? "Workspace";

  return (
    <header className="flex h-24 items-center justify-between gap-4 border-b border-white/15 px-4 md:px-7">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">LINK Team Hub workspace</p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className="relative rounded-md p-2 text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          href="/notifications"
        >
          <Bell aria-hidden className="size-5" />
          {unreadCount > 0 && <span aria-hidden className="absolute -top-0.5 -right-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </Link>

        <Link
          aria-label="Your team profile"
          className="flex items-center gap-2 rounded-md text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          href="/team"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white text-xs font-bold text-blue-700">
            {initials}
          </span>
        </Link>
      </div>
    </header>
  );
}

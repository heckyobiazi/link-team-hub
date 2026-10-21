"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { workspaceRoutes } from "@/lib/routes";

export function WorkspaceTopbar({ initials }: { initials: string }) {
  const pathname = usePathname();
  const title =
    workspaceRoutes.find((r) => r.href === pathname)?.label ?? "Workspace";

  return (
    <header className="flex h-24 items-center justify-between gap-4 border-b border-white/15 px-4 md:px-7">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">Workspace / Product &amp; engineering</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="relative hidden lg:block">
          <span className="sr-only">Search workspace</span>
          <Search
            aria-hidden
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            className="h-9 w-72 rounded-md border border-white/10 bg-white/5 pr-12 pl-9 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            placeholder="Search workspace"
            type="search"
          />
          <kbd className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-slate-500">
            ⌘ K
          </kbd>
        </label>

        <span className="hidden items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 text-xs text-slate-300 sm:flex">
          <span aria-hidden className="size-1.5 rounded-full bg-slate-400" />
          Demo Data
        </span>

        <button
          aria-label="Notifications"
          className="relative text-slate-300 hover:text-white"
          type="button"
        >
          <Bell aria-hidden className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-blue-500" />
        </button>

        <button
          aria-label="Account menu"
          className="flex items-center gap-2 text-slate-300"
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white text-xs font-bold text-blue-700">
            {initials}
          </span>
          <ChevronDown aria-hidden className="size-4" />
        </button>
      </div>
    </header>
  );
}

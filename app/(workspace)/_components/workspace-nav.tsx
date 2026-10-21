"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

const icons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/reports": FileText,
  "/tasks": ListChecks,
  "/projects": ClipboardList,
  "/team": Users,
  "/calendar": CalendarDays,
  "/meeting": CalendarClock,
  "/availability": Clock,
  "/notifications": Bell,
  "/overview": LineChart,
  "/settings": Settings,
};

const badges: Record<string, number> = { "/notifications": 3 };

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  const Icon = icons[href] ?? LayoutDashboard;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
        active
          ? "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
      href={href}
    >
      <Icon aria-hidden className="size-4" />
      <span className="flex-1">{label}</span>
      {badges[href] && (
        <span className="text-xs text-slate-300">{badges[href]}</span>
      )}
    </Link>
  );
}

export function WorkspaceNav({
  routes,
}: {
  routes: readonly { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const leadHrefs = ["/overview"];
  const main = routes.filter((r) => !leadHrefs.includes(r.href));
  const leads = routes.filter((r) => leadHrefs.includes(r.href));

  return (
    <nav aria-label="Workspace" className="flex flex-1 flex-col gap-1">
      {main.map((route) => (
        <NavLink
          active={pathname === route.href}
          href={route.href}
          key={route.href}
          label={route.label}
        />
      ))}

      {leads.length > 0 && (
        <p className="mt-6 mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400">
          FOR TEAM LEADS
        </p>
      )}
      {leads.map((route) => (
        <NavLink
          active={pathname === route.href}
          href={route.href}
          key={route.href}
          label={route.label}
        />
      ))}
    </nav>
  );
}

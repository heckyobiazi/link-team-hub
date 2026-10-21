import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const stats: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  { label: "Available Now", value: "8 of 12", note: "Self-declared availability", icon: Users, tone: "text-blue-600" },
  { label: "Reports Submitted", value: "9 of 12", note: "75% of today's updates", icon: FileCheck2, tone: "text-blue-600" },
  { label: "Tasks Completed", value: "14", note: "Across 24 project tasks", icon: CheckCircle2, tone: "text-blue-600" },
  { label: "Open Blockers", value: "3", note: "Across 2 projects", icon: AlertCircle, tone: "text-amber-500" },
];

const updates = [
  { initials: "AM", name: "Alex Morgan", role: "Product designer", time: "9:12 AM", text: "Completed the authentication UI and started testing the invite flow.", project: "Atlas Workspace / Authentication UI", blocked: false },
  { initials: "JL", name: "Jordan Lee", role: "Frontend engineer", time: "9:04 AM", text: "Fixed two mobile layout issues and reviewed an open pull request.", project: "Atlas Workspace / Responsive navigation", blocked: false },
  { initials: "TJ", name: "Taylor James", role: "Frontend engineer", time: "8:56 AM", text: "Working on the project dashboard; blocked by a missing API response.", project: "Atlas Workspace / Project dashboard", blocked: true },
];

const availability = [
  { initials: "AM", name: "Alex Morgan", status: "Available" },
  { initials: "JL", name: "Jordan Lee", status: "Available" },
  { initials: "AK", name: "Avery Kim", status: "Focus Time" },
  { initials: "QD", name: "Quinn Davis", status: "In a Meeting" },
  { initials: "CR", name: "Cameron Reed", status: "Away" },
];

const availabilityTone: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  "Focus Time": "bg-blue-100 text-blue-700",
  "In a Meeting": "bg-blue-100 text-blue-700",
  Away: "bg-slate-200 text-slate-600",
};

const projects = [
  { name: "Atlas Workspace", progress: 72, lead: "Sam Rivera", status: "Needs attention" },
  { name: "Client Portal", progress: 58, lead: "Casey Chen", status: "Needs attention" },
  { name: "Knowledge Base", progress: 85, lead: "Avery Kim", status: "On track" },
];

const blockers = [
  { title: "Missing dashboard API response", detail: "Response schema needed to finish the project dashboard.", meta: "Atlas Workspace · Taylor James", severity: "High" },
  { title: "Invite email template approval", detail: "Confirm the final invitation copy before QA handoff.", meta: "Atlas Workspace · Alex Morgan", severity: "Medium" },
  { title: "Staging access pending", detail: "QA needs staging credentials to validate the client flow.", meta: "Client Portal · Jamie Brooks", severity: "High" },
];

const panel =
  "rounded-lg border border-blue-600 bg-linear-to-b from-blue-950/20 to-black p-5";

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-md shadow-blue-600/30"
    >
      {initials}
    </span>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400 hover:underline"
      href={href}
    >
      {children}
      <ArrowRight aria-hidden className="size-3" />
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-base text-white">Here&apos;s your team&apos;s pulse for today.</h1>
          <p className="mt-6 text-xs text-slate-300">
            Monday, October 19, 2026 · Product &amp; engineering
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          href="/reports"
        >
          <Plus aria-hidden className="size-4" />
          Submit Daily Update
        </Link>
      </div>

      <section aria-label="Summary" className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, tone }) => (
          <article
            className="rounded-lg bg-white p-5 text-slate-900 shadow-lg shadow-blue-600/10 transition-transform hover:-translate-y-0.5"
            key={label}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              {label}
              <Icon aria-hidden className={`size-4 ${tone}`} />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-blue-950">{value}</p>
            <p className="mt-3 text-xs text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
        <section className={panel}>
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Team Updates</h2>
            <PanelLink href="/reports">View all updates</PanelLink>
          </header>
          <ul className="divide-y divide-white/20">
            {updates.map((u) => (
              <li className="py-4 first:pt-0 last:pb-0" key={u.name}>
                <div className="flex items-center gap-3">
                  <Avatar initials={u.initials} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.role}</p>
                  </div>
                  <time className="text-xs text-slate-300">{u.time}</time>
                </div>
                <p className="mt-3 text-sm text-slate-100">{u.text}</p>
                <p className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-blue-500">{u.project}</span>
                  <span
                    className={`rounded px-2 py-1 font-semibold ${
                      u.blocked ? "bg-red-600 text-white" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {u.blocked ? "Blocked" : "Submitted"}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={panel}>
          <h2 className="text-lg font-semibold text-white">Team Availability</h2>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
            8 of 12 available
            <span className="rounded bg-slate-200 px-2 py-1 font-medium text-slate-600">
              Declared status
            </span>
          </div>
          <ul className="mt-5 grid gap-3">
            {availability.map((m) => (
              <li className="flex items-center gap-3 text-sm" key={m.name}>
                <span
                  aria-hidden
                  className="grid size-8 place-items-center rounded-full bg-white text-[10px] font-bold text-blue-700"
                >
                  {m.initials}
                </span>
                <span className="flex-1 text-slate-100">{m.name}</span>
                <span className={`rounded px-2 py-1 text-xs font-semibold ${availabilityTone[m.status]}`}>
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-slate-300">
            Also available: Taylor, Sam, Casey, Riley, Jamie and Morgan.
          </p>
          <p className="mt-5 border-t border-white/20 pt-4 text-xs text-slate-400">
            Shared voluntarily to help coordinate. Not a measure of activity or performance.
          </p>
          <Link
            className="mt-4 inline-block rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            href="/availability"
          >
            Update my status
          </Link>
        </section>

      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-5">
        <section className={`${panel} lg:col-span-2`}>
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Project Progress</h2>
            <PanelLink href="/projects">All projects</PanelLink>
          </header>
          <ul className="divide-y divide-white/20">
            {projects.map((p) => (
              <li className="py-4 first:pt-0 last:pb-0" key={p.name}>
                <p className="flex justify-between text-sm font-semibold text-white">
                  {p.name}
                  <span>{p.progress}%</span>
                </p>
                <progress
                  aria-label={`${p.name} progress`}
                  className="mt-3 h-1 w-full [&::-moz-progress-bar]:bg-blue-600 [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:bg-blue-600"
                  max={100}
                  value={p.progress}
                />
                <p className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  Lead: {p.lead}
                  <span
                    className={`rounded px-2 py-1 font-semibold ${
                      p.status === "On track"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section         className={`${panel} lg:col-span-3`}>
          <h2 className="text-lg font-semibold text-white">Blockers Needing Attention</h2>
          <p className="mt-3 mb-4 text-xs text-slate-300">
            3 open blockers · ordered for coordination, not people
          </p>
          <ul className="divide-y divide-white/20">
            {blockers.map((b) => (
              <li className="py-4 first:pt-0 last:pb-0" key={b.title}>
                <p className="flex items-center justify-between text-sm font-semibold text-white">
                  {b.title}
                  <span
                    className={`rounded px-3 py-1 text-xs ${
                      b.severity === "High" ? "bg-red-600 text-white" : "bg-yellow-500 text-black"
                    }`}
                  >
                    {b.severity}
                  </span>
                </p>
                <p className="mt-3 text-sm text-slate-200">{b.detail}</p>
                <p className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  {b.meta}
                  <PanelLink href="/tasks">View task</PanelLink>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

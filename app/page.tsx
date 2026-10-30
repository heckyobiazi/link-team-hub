import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const roles = [
  {
    title: "Team Member",
    text: "Submit reports, update assigned tasks, and share availability.",
    detail: "Members can edit and delete their own reports.",
  },
  {
    title: "Team Lead",
    text: "Coordinate assignments, projects, and blockers.",
    detail: "Leads can create projects and assign tasks to team members.",
  },
  {
    title: "Executive",
    text: "See overall project health and submitted team reports.",
    detail: "Executives can review the management overview.",
  },
  {
    title: "Administrator",
    text: "Manage workspace roles and access.",
    detail: "Admins control access levels; members cannot grant roles to themselves.",
  },
];

const does = [
  "Shows availability people choose to declare",
  "Keeps daily updates short and consistent",
  "Makes task owners, status, and deadlines visible",
  "Surfaces blockers with enough context to act",
  "Gives leads a project-level view that points to decisions",
];

const doesnt = [
  "Track mouse movement, browser activity, or online presence",
  "Capture screenshots or keystrokes",
  "Score or rank individual productivity",
  "Replace Slack, GitHub, or Google Calendar",
  "Become an HR, timesheet, or payroll system",
];

function RolesSection() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-[#1a2540] bg-[#080d1b] sm:grid-cols-2 lg:grid-cols-4">
      {roles.map((role) => (
        <article
          className="border-b border-[#1a2540] p-5 last:border-b-0 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
          key={role.title}
        >
          <h3 className="mb-2 text-sm font-medium text-white">{role.title}</h3>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {role.text}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
            {role.detail}
          </p>
        </article>
      ))}
    </div>
  );
}

function PrinciplesSection() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-[#1a2540] bg-[#080d1b] md:grid-cols-2">
      <article className="px-5 pt-5 pb-3">
        <h3 className="mb-2 text-sm font-medium text-white">What LINK does</h3>
        <ul>
          {does.map((item) => (
            <li
              className="flex min-h-8 items-center gap-2 border-b border-[#141d34] py-1.5 text-[11px] text-slate-300 last:border-b-0"
              key={item}
            >
              <Check
                className="shrink-0 text-emerald-400"
                size={15}
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
      <article className="border-t border-[#1a2540] px-5 pt-5 pb-3 md:border-t-0 md:border-l">
        <h3 className="mb-2 text-sm font-medium text-white">
          What LINK never does
        </h3>
        <ul>
          {doesnt.map((item) => (
            <li
              className="flex min-h-8 items-center gap-2 border-b border-[#141d34] py-1.5 text-[11px] text-slate-300 last:border-b-0"
              key={item}
            >
              <X
                className="shrink-0 text-red-400"
                size={15}
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export default function Home() {
  return (
    <main id="top" className="bg-black ">
      <header className="mx-auto flex w-full max-w-6xl items-start justify-between px-6 pt-8 sm:px-8">
        <img src="/LINK Logo White.svg" alt="LINK Team Hub" className="h-8 w-auto" />
        <nav aria-label="Account">
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="secondary"
            className="mt-2 bg-zinc-800 px-4 py-2 text-xs text-zinc-200 hover:bg-zinc-500 hover:text-blue-700"
          >
            Login
          </Button>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center bg-black px-4 py-16 text-center" >
        <Badge className="h-auto rounded-full bg-black px-2 py-1 text-xs font-medium text-white">For the Team</Badge>
        <h1 className="bg-linear-to-r from-white via-purple-500 to-blue-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          Plan It. Schedule It.
          <br />
          Perform It
        </h1>
        <p className="max-w-xl mt-4 text-lg text-white">
          A shared place for daily updates, clear priorities and voluntary team
          availability.
        </p>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="border-t border-zinc-600" />
      </div>

      <section
        className="mx-auto mt-16 w-full max-w-6xl px-6 sm:px-8"
        id="roles"
      >
        <div className="mb-8 max-w-xl">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">
            The right view for each person.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-400">
            Permissions are enforced on the server and in the data layer, not
            by hiding buttons.
          </p>
        </div>
        <RolesSection />
      </section>

      <section
        className="mx-auto mt-20 w-full max-w-6xl px-6 sm:px-8"
        id="principles"
      >
        <div className="mb-8 max-w-xl">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">
            Coordination, not monitoring.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-400">
            The hub exists to make teamwork clearer. It never watches people.
          </p>
        </div>
        <PrinciplesSection />
      </section>

      <section
        className="mx-auto mt-32 flex w-full max-w-6xl flex-col items-start justify-between gap-6 rounded-xl border border-[#1a2540] bg-[radial-gradient(ellipse_at_top_left,#142e70_0%,#0a1024_45%,#080d1b_90%)] px-6 py-10 sm:flex-row sm:items-center sm:px-12"
        id="contact">
        <div>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Plan it. Schedule it. Perform it.
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to open the live team workspace.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/login" />}
          size="lg"
          className="h-10 rounded-md bg-blue-600 px-4 text-xs text-white hover:bg-blue-500">
          Open the workspace <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </section>

      <footer className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-2 px-6 pb-8 text-[10px] text-slate-500 sm:flex-row sm:justify-between sm:px-8">
        <span>LINK Team Hub · Team collaboration workspace</span>
        <span>
          Secure sign-in and workspace access are handled by Kinde.
        </span>
      </footer>
    </main>
  );
}

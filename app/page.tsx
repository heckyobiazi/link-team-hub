import { ArrowRight, Check, X } from "lucide-react";
import FeatureShowcase from "./feature-showcase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const updates = [
  {
    initials: "SB",
    name: "Miss Sabrina",
    team: "Access & Roles",
    time: "9:12",
    text: "Finished the invite flow and wired role checks.",
    color: "blue",
  },
  {
    initials: "VK",
    name: "Mr Victor",
    team: "Daily Reports",
    time: "9:40",
    text: "Drafted the daily report form; reviewing empty states next.",
    color: "violet",
  },
  {
    initials: "MK",
    name: "Mr Makarizo",
    team: "Access & Roles",
    time: "10:05",
    text: "Waiting on SSO configuration from the admin team.",
    color: "teal",
  },
];

const progress = [
  { name: "Daily Reports", percent: 72 },
  { name: "Tasks & Projects", percent: 45 },
  { name: "Access & Roles", percent: 28 },
];

const availability = [
  { name: "Mr Marvel", status: "Available", color: "green" },
  { name: "Miss Sabrina", status: "Focus Time", color: "blue" },
  { name: "Mr Victor", status: "In a Meeting", color: "cyan" },
  { name: "Mr Makarizo", status: "Away", color: "violet" },
];

const avatarColors: Record<string, string> = {
  blue: "bg-[#112452] text-blue-200",
  violet: "bg-[#251a47] text-violet-300",
  teal: "bg-[#102d3d] text-cyan-200",
};

const statusColors: Record<string, string> = {
  green: "bg-emerald-400",
  blue: "bg-blue-500",
  cyan: "bg-cyan-400",
  violet: "bg-violet-400",
};

const roles = [
  {
    title: "Team Member",
    text: "Submit updates, manage own tasks, share availability, see team context.",
    detail: "Creates and edits own reports and permitted tasks.",
  },
  {
    title: "Team Lead",
    text: "Review updates, coordinate assignments, resolve blockers, watch project progress.",
    detail: "Everything a member can do, plus managing projects and team summaries.",
  },
  {
    title: "Executive",
    text: "See overall project health and major blockers at a glance.",
    detail: "Read-only access to high-level reports, summaries and blockers.",
  },
  {
    title: "Administrator",
    text: "Manage access, roles and workspace configuration.",
    detail: "Invites and disables users, assigns roles, reviews audit events.",
  },
];

const does = [
  "Shows availability people choose to declare",
  "Keeps daily updates short and consistent",
  "Makes task owners, status and deadlines visible",
  "Surfaces blockers with enough context to act",
  "Gives leads a project-level view that points to decisions",
];

const doesnt = [
  "Track mouse movement, browser activity or online presence",
  "Capture screenshots or keystrokes",
  "Score or rank individual productivity",
  "Replace Slack, GitHub or Google Calendar",
  "Become an HR, timesheet or payroll system",
];

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-h-16 flex-col justify-center gap-1 border-r border-b border-slate-500/20 px-3.5 py-2.5 last:border-r-0 max-sm:nth-[2n]:border-r-0 sm:border-b-0">
      <span className="text-[10px] text-slate-400">{label}</span>
      <strong
        className={`text-2xl leading-none font-medium tracking-tight ${accent ? "text-amber-400" : "text-white"}`}
      >
        {value}
      </strong>
    </div>
  );
}

function DashboardPreview() {
  return (
    <Card className="gap-0 rounded-xl bg-black py-0 text-slate-300 ring-[#1a2540] shadow-2xl shadow-black/20">
      <CardHeader className="flex h-8 grid-cols-none items-center gap-2.5 rounded-none border-b border-[#1a2540] px-3 py-0 text-[10px] text-slate-500">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-1.5 rounded-full bg-slate-500/50" />
          <span className="size-1.5 rounded-full bg-slate-500/50" />
          <span className="size-1.5 rounded-full bg-slate-500/50" />
        </div>
        <span>LINK Team Hub · Dashboard</span>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4 sm:items-center">
          <div>
            <h3 className="mb-1 text-base font-medium text-white">
              Good morning,  Mr Tom Lesh
            </h3>
            <p className="text-[11px] text-slate-400">Monday, October 19, 2026</p>
          </div>
          <Button
            render={<Link href="#feature-demo" />}
            size="sm"
            className="h-8 rounded-md bg-blue-600 px-3 text-[10px] text-white hover:bg-blue-500"
          >
            Submit daily update
          </Button>
        </div>

        <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-lg border border-[#1a2540] sm:grid-cols-4">
          <Metric label="Available now" value="7/12" />
          <Metric label="Reports submitted" value="9/12" />
          <Metric label="Tasks completed" value="6" />
          <Metric label="Open blockers" value="3" accent />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.22fr_0.96fr] md:gap-0">
          <div className="md:pr-5">
            <h4 className="mb-2 text-[11px] font-semibold text-slate-200">
              Team updates
            </h4>
            <div className="flex flex-col">
              {updates.map((update) => (
                <div
                  className="flex min-h-13 items-center gap-2.5 border-b border-[#141d34]"
                  key={update.initials}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full border border-[#253962] text-[8px] font-semibold ${avatarColors[update.color]}`}
                  >
                    {update.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="mb-0.5 text-[11px] leading-snug text-slate-200">
                      {update.text}
                    </p>
                    <span className="block truncate text-[9px] text-slate-500">
                      {update.name} · {update.team} · {update.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="mt-5 mb-2 text-[11px] font-semibold text-slate-200">
              Project progress
            </h4>
            <div className="flex flex-col gap-2.5">
              {progress.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-[10px] text-slate-300">
                    <span>{item.name}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <progress
                    className="h-1 w-full appearance-none overflow-hidden rounded-full bg-[#18223d] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-blue-600 [&::-webkit-progress-bar]:bg-[#18223d] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-600"
                    aria-label={`${item.name} progress`}
                    value={item.percent}
                    max={100}
                  />
                </div>
              ))}
            </div>
          </div>

          <aside className="border-t border-[#1a2540] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
            <h4 className="mb-2 text-[11px] font-semibold text-slate-200">
              Your availability
            </h4>
            <div
              className="flex flex-wrap gap-1.5"
              aria-label="Availability options"
            >
              <Badge variant="outline" className="h-auto rounded-full border-blue-600 bg-[#102054] px-2 py-1 text-[9px] leading-none text-blue-100">
                Available
              </Badge>
              <Badge variant="outline" className="h-auto rounded-full border-[#27314a] px-2 py-1 text-[9px] leading-none text-slate-400">
                Focus Time
              </Badge>
              <Badge variant="outline" className="h-auto rounded-full border-[#27314a] px-2 py-1 text-[9px] leading-none text-slate-400">
                In a Meeting
              </Badge>
              <Badge variant="outline" className="h-auto rounded-full border-[#27314a] px-2 py-1 text-[9px] leading-none text-slate-400">
                Away
              </Badge>
            </div>
            <p className="mt-2 mb-4 text-[9px] text-slate-500">
              Declared by you, not detected. May not be real-time.
            </p>

            <h4 className="mb-1 text-[11px] font-semibold text-slate-200">
              Team availability
            </h4>
            <ul>
              {availability.map((person) => (
                <li
                  className="flex min-h-7 items-center gap-2 border-b border-[#141d34] text-[10px] text-slate-300"
                  key={person.name}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${statusColors[person.color]}`}
                  />
                  <span>{person.name}</span>
                  <span className="ml-auto text-slate-400">{person.status}</span>
                </li>
              ))}
            </ul>

            <h4 className="mt-4 mb-2 text-[11px] font-semibold text-slate-200">
              Blockers needing attention
            </h4>
            <div className="flex min-h-11 items-center justify-between gap-2.5">
              <div className="flex flex-col gap-0.5 text-[10px] text-slate-300">
                <span>SSO configuration pending</span>
                <small className="text-[9px] text-slate-500">
                  Tomas Novak · Access & Roles
                </small>
              </div>
              <Badge variant="outline" className="h-auto rounded border-amber-800 px-1.5 py-0.5 text-[8px] leading-none text-amber-400">
                Urgent
              </Badge>
            </div>
            <div className="flex min-h-11 items-center justify-between gap-2.5">
              <div className="flex flex-col gap-0.5 text-[10px] text-slate-300">
                <span>Report edit policy undecided</span>
                <small className="text-[9px] text-slate-500">
                  Mara Reyes · Daily Reports
                </small>
              </div>
              <Badge variant="outline" className="h-auto rounded border-red-900 px-1.5 py-0.5 text-[8px] leading-none text-red-400">
                High
              </Badge>
            </div>
          </aside>
          </div>
        </CardContent>
        </Card>
  );
}

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
        className="mx-auto mt-20 w-full max-w-6xl px-6 sm:px-8"
        id="demo"
      >
        <div className="mb-8 max-w-xl">
          <h2 className="mt-2 mb-3 max-w-md text-3xl font-semibold tracking-tight text-white">
            Open the hub and see where the team stands.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-400">
            One dashboard shows today&apos;s updates, who is reachable, how
            projects are moving and what needs help. Try setting your own
            status.
          </p>
        </div>
        <DashboardPreview />
      </section>

      <section
        className="mx-auto mt-20 w-full max-w-6xl px-6 sm:px-8"
        id="feature-demo"
      >
        <div className="mb-8 max-w-xl">
          <h2 className="mb-3 max-w-md text-3xl font-semibold tracking-tight text-white">
            Everything the hub does, in nine parts.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-400">
            Each part covers an everyday coordination job. Pick one to see how
            it works.
          </p>
        </div>
        <FeatureShowcase />
      </section>

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
            Start with the five-day prototype and see if it helps the team.
          </p>
        </div>
        <Button
          render={<Link href="#demo" />}
          size="lg"
          className="h-10 rounded-md bg-blue-600 px-4 text-xs text-white hover:bg-blue-500">
          Request a walkthrough <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </section>

      <footer className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-2 px-6 pb-8 text-[10px] text-slate-500 sm:flex-row sm:justify-between sm:px-8">
        <span>LINK Team Hub · Proposed concept for discussion</span>
        <span>
          All people, projects, reports and events shown are fictional demo
          data.
        </span>
      </footer>
    </main>
  );
}

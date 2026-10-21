export type Status = "todo" | "in-progress" | "blocked" | "done";

export const statusStyles: Record<Status, string> = {
  todo: "bg-slate-500/20 text-slate-300",
  "in-progress": "bg-blue-500/20 text-blue-300",
  blocked: "bg-red-500/20 text-red-300",
  done: "bg-emerald-500/20 text-emerald-300",
};

export const statusLabels: Record<Status, string> = {
  todo: "To do",
  "in-progress": "In progress",
  blocked: "Blocked",
  done: "Done",
};

export const members = [
  { id: "ada", name: "Ada Okafor", role: "Admin", focus: "Operations", availability: "Available" },
  { id: "tunde", name: "Tunde Bello", role: "Lead", focus: "Engineering", availability: "In a meeting" },
  { id: "mira", name: "Mira Hassan", role: "Member", focus: "Design", availability: "Available" },
  { id: "jon", name: "Jon Reyes", role: "Member", focus: "Engineering", availability: "Away" },
  { id: "sade", name: "Sade Adeyemi", role: "Executive", focus: "Strategy", availability: "Available" },
] as const;

export const projects = [
  { id: "website", name: "Website relaunch", owner: "mira", progress: 70, due: "Nov 14", status: "in-progress" },
  { id: "mobile", name: "Mobile app beta", owner: "tunde", progress: 35, due: "Dec 02", status: "blocked" },
  { id: "onboarding", name: "Client onboarding flow", owner: "ada", progress: 100, due: "Oct 10", status: "done" },
  { id: "analytics", name: "Analytics dashboard", owner: "jon", progress: 10, due: "Jan 20", status: "todo" },
] as const satisfies readonly {
  id: string;
  name: string;
  owner: string;
  progress: number;
  due: string;
  status: Status;
}[];

export const tasks = [
  { id: 1, title: "Finalize homepage copy", project: "website", assignee: "mira", due: "Oct 22", status: "in-progress" },
  { id: 2, title: "Fix push notification crash", project: "mobile", assignee: "tunde", due: "Oct 21", status: "blocked" },
  { id: 3, title: "Review pricing page design", project: "website", assignee: "sade", due: "Oct 24", status: "todo" },
  { id: 4, title: "Write API contract for reports", project: "analytics", assignee: "jon", due: "Oct 30", status: "todo" },
  { id: 5, title: "Ship onboarding checklist", project: "onboarding", assignee: "ada", due: "Oct 10", status: "done" },
  { id: 6, title: "Set up staging environment", project: "mobile", assignee: "jon", due: "Oct 25", status: "in-progress" },
] as const satisfies readonly {
  id: number;
  title: string;
  project: string;
  assignee: string;
  due: string;
  status: Status;
}[];

export const reports = [
  {
    id: 1,
    author: "mira",
    date: "Oct 20",
    done: "Drafted hero and feature copy for the website.",
    next: "Review copy with Sade, start pricing page.",
    blockers: "None",
  },
  {
    id: 2,
    author: "tunde",
    date: "Oct 20",
    done: "Reproduced the notification crash on Android 14.",
    next: "Patch and test on device farm.",
    blockers: "Waiting on push credentials from admin.",
  },
  {
    id: 3,
    author: "jon",
    date: "Oct 19",
    done: "Provisioned the staging database.",
    next: "Seed data and connect the app.",
    blockers: "None",
  },
] as const;

export const events = [
  { id: 1, title: "Team standup", day: "Mon", time: "09:30", kind: "Meeting" },
  { id: 2, title: "Website review", day: "Tue", time: "11:00", kind: "Review" },
  { id: 3, title: "Mobile beta sync", day: "Wed", time: "14:00", kind: "Meeting" },
  { id: 4, title: "Pricing page due", day: "Thu", time: "17:00", kind: "Deadline" },
  { id: 5, title: "Weekly wrap-up", day: "Fri", time: "16:00", kind: "Meeting" },
] as const;

export function memberName(id: string) {
  return members.find((m) => m.id === id)?.name ?? id;
}

export function projectName(id: string) {
  return projects.find((p) => p.id === id)?.name ?? id;
}

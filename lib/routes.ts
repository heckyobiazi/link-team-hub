export type Role = "member" | "lead" | "executive" | "admin";

export const publicRoutes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  accessDenied: "/access-denied",
} as const;

export const workspaceRoutes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
  { href: "/tasks", label: "Tasks" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/messages", label: "Messages" },
  { href: "/calendar", label: "Calendar" },
  { href: "/meeting", label: "Meetings" },
  { href: "/availability", label: "Availability" },
  { href: "/notifications", label: "Notifications" },
  {
    href: "/overview",
    label: "Management Overview",
    roles: ["lead", "executive", "admin"],
  },
  { href: "/settings", label: "Settings", roles: ["admin"] },
] as const satisfies readonly {
  href: string;
  label: string;
  roles?: readonly Role[];
}[];

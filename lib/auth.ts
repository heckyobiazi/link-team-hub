import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { workspaceRoutes, type Role } from "./routes";

// Highest first. A user with several Kinde roles gets the most privileged one.
const rolePriority: readonly Role[] = ["admin", "executive", "lead", "member"];

export async function getCurrentUser() {
  const { isAuthenticated, getUser, getRoles } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  const [user, kindeRoles] = await Promise.all([getUser(), getRoles()]);
  const keys = new Set((kindeRoles ?? []).map((r) => r.key));
  const role = rolePriority.find((r) => keys.has(r)) ?? "member";
  const name =
    [user?.given_name, user?.family_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Team member";

  return {
    name,
    email: user?.email ?? null,
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    role,
  };
}

export function canAccess(role: Role, allowed?: readonly Role[]) {
  return !allowed || allowed.includes(role);
}

export function visibleRoutes(role: Role) {
  return workspaceRoutes.filter((route) =>
    canAccess(role, "roles" in route ? route.roles : undefined),
  );
}

export async function requireRole(allowed: readonly Role[]) {
  const { role } = await getCurrentUser();

  if (!canAccess(role, allowed)) {
    redirect("/access-denied");
  }
}

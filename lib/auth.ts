import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { and, count, eq, isNull } from "drizzle-orm";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notifications, teamMembers } from "@/lib/db/schema";
import { workspaceRoutes, type Role } from "./routes";

const rolePriority: readonly Role[] = ["admin", "executive", "lead", "member"];

async function getKindeIdentity() {
  const { isAuthenticated, getUser, getRoles } = getKindeServerSession();

  if (!(await isAuthenticated())) return null;

  const [user, kindeRoles] = await Promise.all([getUser(), getRoles()]);
  if (!user?.id) return null;

  const keys = new Set((kindeRoles ?? []).map((role) => role.key));
  const initialRole = rolePriority.find((role) => keys.has(role)) ?? "member";
  const name =
    [user.given_name, user.family_name].filter(Boolean).join(" ") ||
    user.email ||
    "Team member";

  return {
    kindeUserId: user.id,
    name,
    email: user.email ?? null,
    initialRole,
  };
}

export const getAuthenticatedMember = cache(
  async function getAuthenticatedMember() {
    const identity = await getKindeIdentity();
    if (!identity) return null;

    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.kindeUserId, identity.kindeUserId))
      .limit(1);

    let member = existing;
    if (!member) {
      const [created] = await db
        .insert(teamMembers)
        .values({
          kindeUserId: identity.kindeUserId,
          name: identity.name,
          email: identity.email,
          role: identity.initialRole,
        })
        .onConflictDoNothing({ target: teamMembers.kindeUserId })
        .returning();

      if (created) {
        member = created;
      } else {
        [member] = await db
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.kindeUserId, identity.kindeUserId))
          .limit(1);
      }
    }

    if (!member || !member.isActive) return null;

    const name = member.name || identity.name;
    return {
      ...member,
      name,
      email: member.email ?? identity.email,
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  },
);

export const getCurrentUser = cache(
  async function getCurrentUser(options?: { allowIncomplete?: boolean }) {
    const member = await getAuthenticatedMember();
    if (!member) redirect("/api/auth/login");
    if (!options?.allowIncomplete && !member.jobTitle) redirect("/onboarding");
    return member;
  },
);

export function canAccess(role: Role, allowed?: readonly Role[]) {
  return !allowed || allowed.includes(role);
}

export function canInviteTeamMembers(user: { role: Role; email: string | null }) {
  const configuredAdminEmail = process.env.LINK_TEAM_ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  return (
    user.role === "admin" ||
    (!!configuredAdminEmail && user.email?.trim().toLowerCase() === configuredAdminEmail)
  );
}

export function visibleRoutes(role: Role) {
  return workspaceRoutes.filter((route) =>
    canAccess(role, "roles" in route ? route.roles : undefined),
  );
}

export async function requireRole(allowed: readonly Role[]) {
  const user = await getCurrentUser();
  if (!canAccess(user.role, allowed)) redirect("/access-denied");
}

export async function getUnreadNotificationCount(memberId: string) {
  const [result] = await db
    .select({ total: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, memberId),
        isNull(notifications.readAt),
      ),
    );
  return result.total;
}

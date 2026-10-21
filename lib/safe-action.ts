// lib/safe-action.ts
import { createSafeActionClient } from "next-safe-action";
import * as Sentry from "@sentry/node";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    Sentry.captureException(e);
  },
});

export const protectedActionClient = actionClient.use(async ({ next }) => {
  const { isAuthenticated, getUser, getRoles } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const [user, kindeRoles] = await Promise.all([getUser(), getRoles()]);

  if (!user) {
    throw new Error("Unauthorized");
  }

  const rolePriority = ["admin", "executive", "lead", "member"] as const;
  const roleKeys = new Set((kindeRoles ?? []).map((role) => role.key));
  const role = rolePriority.find((candidate) => roleKeys.has(candidate)) ?? "member";

  return next({
    ctx: {
      user: {
        id: user.id,
        email: user.email ?? null,
        role,
      },
    },
  });
});
import { createSafeActionClient } from "next-safe-action";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedMember } from "@/lib/auth";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    Sentry.captureException(error);
    return "Something went wrong. Please try again.";
  },
});

export const protectedActionClient = actionClient.use(async ({ next }) => {
  const user = await getAuthenticatedMember();
  if (!user) throw new Error("Unauthorized");

  return next({
    ctx: {
      user: {
        id: user.id,
        kindeUserId: user.kindeUserId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { canInviteTeamMembers } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { sendKindeOrganizationInvite } from "@/lib/kinde-invitations";
import { protectedActionClient } from "@/lib/safe-action";

export const inviteTeamMember = protectedActionClient
  .inputSchema(z.object({ email: z.email().trim().max(320) }))
  .action(async ({ parsedInput, ctx }) => {
    if (!canInviteTeamMembers(ctx.user)) {
      throw new Error("Only team admins can invite members.");
    }

    const email = parsedInput.email.toLowerCase();
    const [existingMember] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(and(eq(teamMembers.email, email), eq(teamMembers.isActive, true)))
      .limit(1);

    if (existingMember) {
      throw new Error("That email already belongs to an active team member.");
    }

    try {
      await sendKindeOrganizationInvite(email);
    } catch (error) {
      Sentry.captureException(error);
      return {
        success: false,
        error:
          "Kinde could not create the invitation. Check the invitation policy, organization code, and M2M API access, then try again.",
      };
    }

    revalidatePath("/team");
    return { success: true, email };
  });

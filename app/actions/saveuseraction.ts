"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedActionClient } from "@/lib/safe-action";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";

export const saveTeamMember = protectedActionClient
  .inputSchema(
    z.object({
      name: z.string().trim().min(1).max(160),
      email: z.email().nullable().optional(),
      focus: z.string().trim().max(120).nullable().optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const kindeUserId = ctx.user.id;

    const [existingMember] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.kindeUserId, kindeUserId))
      .limit(1);

    if (existingMember) {
      const [member] = await db
        .update(teamMembers)
        .set({
          name: parsedInput.name,
          email: parsedInput.email ?? null,
          focus: parsedInput.focus ?? null,
          updatedAt: new Date(),
        })
        .where(eq(teamMembers.kindeUserId, kindeUserId))
        .returning();

      return { member };
    }

    const [member] = await db
      .insert(teamMembers)
      .values({
        kindeUserId,
        name: parsedInput.name,
        email: parsedInput.email ?? null,
        focus: parsedInput.focus ?? null,
      })
      .returning();

    return { member };
  });
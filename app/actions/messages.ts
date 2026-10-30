"use server";

import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  auditLogs,
  conversationMembers,
  conversations,
  messages,
  notifications,
  teamMembers,
} from "@/lib/db/schema";
import { normalizeSectionKey } from "@/lib/messages";
import { protectedActionClient } from "@/lib/safe-action";

async function requireConversationAccess(conversationId: string, memberId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!conversation) throw new Error("Conversation not found");

  if (conversation.kind === "section") {
    const [member] = await db
      .select({ focus: teamMembers.focus })
      .from(teamMembers)
      .where(and(eq(teamMembers.id, memberId), eq(teamMembers.isActive, true)))
      .limit(1);
    if (
      !member?.focus ||
      normalizeSectionKey(member.focus) !== conversation.sectionKey
    ) {
      throw new Error("You do not have access to this section chat");
    }
    return conversation;
  }

  const [membership] = await db
    .select({ memberId: conversationMembers.memberId })
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.memberId, memberId),
      ),
    )
    .limit(1);
  if (!membership) throw new Error("You are not a member of this chat");
  return conversation;
}

export const createConversation = protectedActionClient
  .inputSchema(
    z.object({
      memberIds: z.array(z.string().uuid()).min(1).max(30),
      name: z.string().trim().max(120).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const memberIds = [...new Set(parsedInput.memberIds)];
    if (memberIds.includes(ctx.user.id)) {
      throw new Error("Choose another member to start a chat");
    }

    const activeMembers = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(
        and(inArray(teamMembers.id, memberIds), eq(teamMembers.isActive, true)),
      );
    if (activeMembers.length !== memberIds.length) {
      throw new Error("One or more selected members are unavailable");
    }

    let conversationId: string;
    let kind: "direct" | "group";

    if (memberIds.length === 1) {
      kind = "direct";
      const directKey = [ctx.user.id, memberIds[0]].sort().join(":");
      await db
        .insert(conversations)
        .values({ kind, directKey, createdById: ctx.user.id })
        .onConflictDoNothing({ target: conversations.directKey });
      const [conversation] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(eq(conversations.directKey, directKey))
        .limit(1);
      if (!conversation) throw new Error("Could not start this conversation");
      conversationId = conversation.id;
    } else {
      kind = "group";
      const name = parsedInput.name?.trim();
      if (!name) throw new Error("Add a name for the group chat");
      const [conversation] = await db
        .insert(conversations)
        .values({ kind, name, createdById: ctx.user.id })
        .returning({ id: conversations.id });
      conversationId = conversation.id;
    }

    await db
      .insert(conversationMembers)
      .values(
        [ctx.user.id, ...memberIds].map((memberId) => ({
          conversationId,
          memberId,
          lastReadAt: new Date(),
        })),
      )
      .onConflictDoNothing();

    await db.insert(auditLogs).values({
      actorId: ctx.user.id,
      action: kind === "direct" ? "message.direct_chat_created" : "message.group_created",
      entityType: "conversation",
      entityId: conversationId,
    });

    revalidatePath("/messages");
    revalidatePath("/dashboard", "layout");
    return { success: true, conversationId };
  });

export const getConversationMessages = protectedActionClient
  .inputSchema(z.object({ conversationId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await requireConversationAccess(parsedInput.conversationId, ctx.user.id);
    const rows = await db
      .select({
        id: messages.id,
        body: messages.body,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: teamMembers.name,
      })
      .from(messages)
      .innerJoin(teamMembers, eq(messages.senderId, teamMembers.id))
      .where(eq(messages.conversationId, parsedInput.conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(50);
    return { success: true, messages: rows.reverse() };
  });

export const markConversationRead = protectedActionClient
  .inputSchema(z.object({ conversationId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const conversation = await requireConversationAccess(
      parsedInput.conversationId,
      ctx.user.id,
    );
    if (conversation.kind !== "section") {
      await db
        .update(conversationMembers)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(conversationMembers.conversationId, conversation.id),
            eq(conversationMembers.memberId, ctx.user.id),
          ),
        );
    }
    return { success: true };
  });

export const sendMessage = protectedActionClient
  .inputSchema(
    z.object({
      conversationId: z.string().uuid(),
      body: z.string().trim().min(1).max(2000),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const conversation = await requireConversationAccess(
      parsedInput.conversationId,
      ctx.user.id,
    );
    const [message] = await db
      .insert(messages)
      .values({
        conversationId: conversation.id,
        senderId: ctx.user.id,
        body: parsedInput.body,
      })
      .returning({ id: messages.id });
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));
    await db.insert(auditLogs).values({
      actorId: ctx.user.id,
      action: "message.sent",
      entityType: "message",
      entityId: message.id,
    });

    const recipients = conversation.kind === "section"
      ? (await db
          .select({ id: teamMembers.id, focus: teamMembers.focus })
          .from(teamMembers)
          .where(eq(teamMembers.isActive, true)))
          .filter((member) => member.focus && normalizeSectionKey(member.focus) === conversation.sectionKey)
          .map((member) => member.id)
      : (await db
          .select({ memberId: conversationMembers.memberId })
          .from(conversationMembers)
          .where(
            and(
              eq(conversationMembers.conversationId, conversation.id),
              ne(conversationMembers.memberId, ctx.user.id),
            ),
          ))
          .map((member) => member.memberId);

    if (recipients.length) {
      const title = conversation.kind === "section"
        ? `${conversation.name} section chat`
        : conversation.name || "Direct message";
      await db.insert(notifications).values(
        recipients.map((recipientId) => ({
          recipientId,
          actorId: ctx.user.id,
          type: "new_message",
          title: "New message",
          message: `${ctx.user.name} sent a message in ${title}.`,
          href: `/messages?conversation=${conversation.id}`,
        })),
      );
    }

    revalidatePath("/messages");
    revalidatePath("/notifications");
    revalidatePath("/dashboard", "layout");
    return { success: true, messageId: message.id };
  });

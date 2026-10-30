import type { Metadata } from "next";
import { Suspense } from "react";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  conversationMembers,
  conversations,
  messages,
  teamMembers,
} from "@/lib/db/schema";
import { normalizeSectionKey, ensureSectionConversations } from "@/lib/messages";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { WorkspacePageFallback } from "../_components/workspace-page-fallback";
import { MessagingWorkspace } from "../_components/messaging-workspace";

export const metadata: Metadata = { title: "Messages" };

type SearchParams = Promise<{ conversation?: string }>;

async function MessagesContent({ searchParams }: { searchParams: SearchParams }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  await ensureSectionConversations();

  const [contacts, memberConversationRows, allConversations] = await Promise.all([
    db
      .select({ id: teamMembers.id, name: teamMembers.name, focus: teamMembers.focus })
      .from(teamMembers)
      .where(and(eq(teamMembers.isActive, true), ne(teamMembers.id, user.id)))
      .orderBy(teamMembers.name),
    db
      .select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(eq(conversationMembers.memberId, user.id)),
    db.select().from(conversations).orderBy(desc(conversations.updatedAt)),
  ]);

  const memberConversationIds = new Set(
    memberConversationRows.map((row) => row.conversationId),
  );
  const focusKey = user.focus?.trim() ? normalizeSectionKey(user.focus) : null;
  const visibleConversations = allConversations.filter((conversation) =>
    conversation.kind === "section"
      ? Boolean(focusKey && conversation.sectionKey === focusKey)
      : memberConversationIds.has(conversation.id),
  );
  const conversationIds = visibleConversations.map((conversation) => conversation.id);

  const [participantRows, latestMessages] = conversationIds.length
    ? await Promise.all([
        db
          .select({
            conversationId: conversationMembers.conversationId,
            memberId: teamMembers.id,
            name: teamMembers.name,
          })
          .from(conversationMembers)
          .innerJoin(teamMembers, eq(conversationMembers.memberId, teamMembers.id))
          .where(inArray(conversationMembers.conversationId, conversationIds)),
        db
          .select({ conversationId: messages.conversationId, body: messages.body, createdAt: messages.createdAt })
          .from(messages)
          .where(inArray(messages.conversationId, conversationIds))
          .orderBy(desc(messages.createdAt))
          .limit(Math.min(conversationIds.length * 10, 250)),
      ])
    : [[], []];

  const participantsByConversation = new Map<string, string[]>();
  for (const row of participantRows) {
    if (row.memberId === user.id) continue;
    const names = participantsByConversation.get(row.conversationId) ?? [];
    names.push(row.name);
    participantsByConversation.set(row.conversationId, names);
  }
  const latestByConversation = new Map<string, string>();
  for (const row of latestMessages) {
    if (!latestByConversation.has(row.conversationId)) {
      latestByConversation.set(row.conversationId, row.body);
    }
  }

  const conversationSummaries = visibleConversations.map((conversation) => ({
    id: conversation.id,
    kind: conversation.kind,
    name:
      conversation.name ??
      participantsByConversation.get(conversation.id)?.join(", ") ??
      "Direct message",
    preview: latestByConversation.get(conversation.id) ?? "No messages yet",
    updatedAt: conversation.updatedAt,
  }));

  const requestedConversation = visibleConversations.find(
    (conversation) => conversation.id === params.conversation,
  );
  const selectedConversation = requestedConversation ?? visibleConversations[0];

  const initialMessages = selectedConversation
    ? await db
        .select({
          id: messages.id,
          body: messages.body,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          senderName: teamMembers.name,
        })
        .from(messages)
        .innerJoin(teamMembers, eq(messages.senderId, teamMembers.id))
        .where(eq(messages.conversationId, selectedConversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(50)
    : [];

  return (
    <>
      <PageHeader
        title="Messages"
        description="Chat directly, start a group, or talk with teammates who share your team focus."
      />
      <MessagingWorkspace
        contacts={contacts}
        conversations={conversationSummaries}
        currentUserId={user.id}
        initialMessages={initialMessages.reverse()}
        selectedConversationId={selectedConversation?.id ?? null}
      />
    </>
  );
}

export default function MessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<WorkspacePageFallback />}>
      <MessagesContent searchParams={searchParams} />
    </Suspense>
  );
}

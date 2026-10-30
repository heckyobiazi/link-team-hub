import "server-only";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  conversationMembers,
  conversations,
  teamMembers,
} from "@/lib/db/schema";

export function normalizeSectionKey(value: string) {
  return value.trim().toLowerCase();
}

export async function ensureSectionConversations() {
  const members = await db
    .select({ id: teamMembers.id, focus: teamMembers.focus })
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true));

  const sections = new Map<string, { name: string; memberIds: string[] }>();
  for (const member of members) {
    const name = member.focus?.trim();
    if (!name) continue;
    const key = normalizeSectionKey(name);
    const section = sections.get(key) ?? { name, memberIds: [] };
    section.memberIds.push(member.id);
    sections.set(key, section);
  }

  if (!sections.size) return [];

  const keys = [...sections.keys()];
  const existing = await db
    .select({ sectionKey: conversations.sectionKey })
    .from(conversations)
    .where(inArray(conversations.sectionKey, keys));
  const existingKeys = new Set(existing.map((row) => row.sectionKey));

  for (const [sectionKey, section] of sections) {
    if (existingKeys.has(sectionKey)) continue;
    await db
      .insert(conversations)
      .values({ kind: "section", name: section.name, sectionKey })
      .onConflictDoNothing({ target: conversations.sectionKey });
  }

  const sectionRows = await db
    .select({ id: conversations.id, sectionKey: conversations.sectionKey })
    .from(conversations)
    .where(inArray(conversations.sectionKey, keys));
  const membershipValues = sectionRows.flatMap((conversation) =>
    (sections.get(conversation.sectionKey ?? "")?.memberIds ?? []).map(
      (memberId) => ({ conversationId: conversation.id, memberId }),
    ),
  );

  if (membershipValues.length) {
    await db
      .insert(conversationMembers)
      .values(membershipValues)
      .onConflictDoNothing();
  }

  return sectionRows;
}

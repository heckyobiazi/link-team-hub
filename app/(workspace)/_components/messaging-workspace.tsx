"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hash, MessageCircle, Plus, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createConversation,
  getConversationMessages,
  markConversationRead,
  sendMessage,
} from "@/app/actions/messages";

type ConversationSummary = {
  id: string;
  kind: "direct" | "section" | "group";
  name: string;
  preview: string;
  updatedAt: Date;
};

type ChatMessage = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
};

type Contact = { id: string; name: string; focus: string | null };

export function MessagingWorkspace({
  contacts,
  conversations: initialConversations,
  currentUserId,
  initialMessages,
  selectedConversationId,
}: {
  contacts: Contact[];
  conversations: ConversationSummary[];
  currentUserId: string;
  initialMessages: ChatMessage[];
  selectedConversationId: string | null;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(selectedConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, startTransition] = useTransition();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    setActiveId(selectedConversationId);
    setMessages(initialMessages);
  }, [selectedConversationId, initialMessages]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [activeId, conversations],
  );

  useEffect(() => {
    if (!activeId) return;
    let current = true;
    const refreshMessages = async () => {
      const result = await getConversationMessages({ conversationId: activeId });
      if (current && result?.data?.success) {
        setMessages(result.data.messages);
      }
    };

    void markConversationRead({ conversationId: activeId });
    void refreshMessages();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshMessages();
    }, 15000);
    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, [activeId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function toggleMember(memberId: string, checked: boolean | "indeterminate") {
    setSelectedMembers((current) =>
      checked === true
        ? [...new Set([...current, memberId])]
        : current.filter((id) => id !== memberId),
    );
  }

  function startChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    startTransition(async () => {
      const result = await createConversation({
        memberIds: selectedMembers,
        name: groupName,
      });
      if (result?.data?.success) {
        router.push(`/messages?conversation=${result.data.conversationId}`);
      } else {
        setFeedback(result?.serverError ?? "Could not create this chat.");
      }
    });
  }

  function selectConversation(conversationId: string) {
    setActiveId(conversationId);
    setMessages([]);
    setFeedback("");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeId || !draft.trim()) return;
    const body = draft.trim();
    setFeedback("");
    startTransition(async () => {
      const result = await sendMessage({ conversationId: activeId, body });
      if (result?.data?.success) {
        setDraft("");
        const refreshed = await getConversationMessages({ conversationId: activeId });
        if (refreshed?.data?.success) setMessages(refreshed.data.messages);
        setConversations((current) =>
          current
            .map((conversation) =>
              conversation.id === activeId
                ? { ...conversation, preview: body, updatedAt: new Date() }
                : conversation,
            )
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
        );
      } else {
        setFeedback(result?.serverError ?? "Message could not be sent.");
      }
    });
  }

  return (
    <div className="grid min-h-[34rem] gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Your chats</h2>
          <Button
            aria-expanded={showNewChat}
            className="gap-1.5"
            onClick={() => setShowNewChat((value) => !value)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus aria-hidden className="size-4" /> New chat
          </Button>
        </div>

        {showNewChat && (
          <form className="mb-4 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3" onSubmit={startChat}>
            <div>
              <h3 className="text-xs font-semibold text-white">Choose teammates</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Choose one person for a direct message, or several people to create a group chat.
              </p>
            </div>
            <div className="max-h-44 space-y-2 overflow-y-auto">
              {contacts.map((contact) => (
                <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-200" key={contact.id}>
                  <Checkbox
                    checked={selectedMembers.includes(contact.id)}
                    onCheckedChange={(checked) => toggleMember(contact.id, checked)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate">{contact.name}</span>
                    {contact.focus && <span className="block truncate text-[10px] text-slate-500">{contact.focus}</span>}
                  </span>
                </label>
              ))}
              {!contacts.length && <p className="text-xs text-slate-400">No other active team members yet.</p>}
            </div>
            {selectedMembers.length > 1 && (
              <label className="grid gap-1.5 text-xs text-slate-300">
                Group name
                <Input
                  className="bg-black/40 text-white"
                  maxLength={120}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="e.g. Project Phoenix"
                  required
                  value={groupName}
                />
              </label>
            )}
            <Button disabled={pending || selectedMembers.length === 0} size="sm" type="submit">
              {pending ? "Starting…" : selectedMembers.length > 1 ? "Create group chat" : "Start direct chat"}
            </Button>
          </form>
        )}

        <div className="grid gap-1.5">
          {conversations.map((conversation) => {
            const Icon = conversation.kind === "section" ? Hash : conversation.kind === "group" ? Users : MessageCircle;
            return (
              <button
                aria-current={activeId === conversation.id ? "true" : undefined}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${activeId === conversation.id ? "border-blue-500/40 bg-blue-500/10" : "border-transparent hover:bg-white/5"}`}
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                type="button"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <Icon aria-hidden className="size-4 shrink-0 text-cyan-300" />
                  <span className="truncate">{conversation.name}</span>
                </span>
                <span className="mt-1 block truncate pl-6 text-[11px] text-slate-400">{conversation.preview}</span>
              </button>
            );
          })}
        </div>
        {!conversations.length && !showNewChat && (
          <p className="rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
            No chats yet. Start a direct message or create a group. Section chats appear when teammates share a Team focus. Update yours on the <Link className="text-cyan-300 hover:underline" href="/team">Team page</Link>.
          </p>
        )}
      </aside>

      <section aria-label="Conversation" className="flex min-h-[34rem] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
        {activeConversation ? (
          <>
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-500/15 text-cyan-300">
                {activeConversation.kind === "section" ? <Hash aria-hidden className="size-4" /> : activeConversation.kind === "group" ? <Users aria-hidden className="size-4" /> : <MessageCircle aria-hidden className="size-4" />}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-white">{activeConversation.name}</h2>
                <p className="text-[11px] capitalize text-slate-400">{activeConversation.kind === "section" ? "Team section" : activeConversation.kind === "group" ? "Group chat" : "Direct message"}</p>
              </div>
            </header>
            <div aria-live="polite" aria-relevant="additions text" className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.map((message) => {
                const ownMessage = message.senderId === currentUserId;
                return (
                  <article className={`flex ${ownMessage ? "justify-end" : "justify-start"}`} key={message.id}>
                    <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${ownMessage ? "bg-blue-600 text-white" : "bg-white/[0.07] text-slate-100"}`}>
                      {!ownMessage && <p className="mb-1 text-[11px] font-semibold text-cyan-200">{message.senderName}</p>}
                      <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                      <time className={`mt-1 block text-right text-[10px] ${ownMessage ? "text-blue-100/70" : "text-slate-500"}`} dateTime={new Date(message.createdAt).toISOString()}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </time>
                    </div>
                  </article>
                );
              })}
              {!messages.length && <p className="py-8 text-center text-sm text-slate-500">Start the conversation with a message.</p>}
              <div ref={endOfMessagesRef} />
            </div>
            <form className="border-t border-white/10 p-3 sm:p-4" onSubmit={submitMessage}>
              <div className="flex items-end gap-2">
                <Textarea
                  aria-label="Write a message"
                  className="max-h-32 min-h-12 resize-y bg-black/40 text-white"
                  maxLength={2000}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  value={draft}
                />
                <Button aria-label="Send message" className="size-12 shrink-0" disabled={pending || !draft.trim()} type="submit">
                  <Send aria-hidden className="size-4" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Messages are visible only to chat participants and the matching team section.</p>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <MessageCircle aria-hidden className="mx-auto size-9 text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">Choose a chat to get started</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Direct messages, custom group chats, and focus-based section chats are available here.</p>
              <Button className="mt-4" onClick={() => setShowNewChat(true)} size="sm" type="button">
                <Plus aria-hidden className="size-4" /> Start a chat
              </Button>
            </div>
          </div>
        )}
        {feedback && <p aria-live="polite" className="border-t border-white/10 px-4 py-2 text-xs text-red-300">{feedback}</p>}
      </section>
    </div>
  );
}

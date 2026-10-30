"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/workspace";

export function MarkNotificationRead({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function markRead() {
    startTransition(async () => {
      const result = await markNotificationRead({ id });
      if (!result?.data?.success) setError(result?.serverError ?? "Could not update notification.");
    });
  }

  return (
    <span className="grid justify-items-end gap-1">
      <Button disabled={pending} onClick={markRead} size="sm" type="button" variant="outline">
        {pending ? "Saving…" : "Mark read"}
      </Button>
      {error && <span aria-live="polite" className="text-xs text-red-300">{error}</span>}
    </span>
  );
}

export function MarkAllNotificationsRead() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function markAll() {
    setMessage("");
    startTransition(async () => {
      const result = await markAllNotificationsRead({});
      if (result?.data?.success) {
        setMessage("All caught up.");
      } else setMessage(result?.serverError ?? "Could not update notifications.");
    });
  }

  return (
    <span className="flex items-center gap-3">
      <Button disabled={pending} onClick={markAll} type="button" variant="outline">
        {pending ? "Saving…" : "Mark all read"}
      </Button>
      {message && <span aria-live="polite" className="text-xs text-slate-400">{message}</span>}
    </span>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCalendarEvent } from "@/app/actions/workspace";

export function CalendarEventForm() {
  const [type, setType] = useState<"meeting" | "review" | "deadline">("meeting");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const startsAt = String(data.get("startsAt") ?? "");
    const endsAt = String(data.get("endsAt") ?? "");
    setMessage("");
    startTransition(async () => {
      const result = await createCalendarEvent({
        title: String(data.get("title") ?? ""),
        description: String(data.get("description") ?? ""),
        type,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        meetingUrl: String(data.get("meetingUrl") ?? ""),
      });
      if (result?.data?.success) {
        setMessage("Event saved.");
        form.reset();
      } else setMessage(result?.serverError ?? "Check the event details and try again.");
    });
  }

  return (
    <form className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-1.5 text-sm text-slate-300 md:col-span-2">
        Event name
        <Input className="bg-black/40 text-white" maxLength={180} name="title" required />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Type
        <Select onValueChange={(value) => { if (value) setType(value as typeof type); }} value={type}>
          <SelectTrigger className="w-full bg-black/40 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Start
        <Input className="bg-black/40 text-white" name="startsAt" required type="datetime-local" />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        End (optional)
        <Input className="bg-black/40 text-white" name="endsAt" type="datetime-local" />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Meeting link (optional)
        <Input className="bg-black/40 text-white" name="meetingUrl" placeholder="https://…" type="url" />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300 md:col-span-2">
        Notes (optional)
        <Textarea className="bg-black/40 text-white" maxLength={2000} name="description" />
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button disabled={pending} type="submit">{pending ? "Saving…" : "Add to calendar"}</Button>
        {message && <p aria-live="polite" className="text-sm text-slate-300">{message}</p>}
      </div>
    </form>
  );
}

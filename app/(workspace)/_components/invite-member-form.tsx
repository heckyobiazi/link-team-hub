"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteTeamMember } from "@/app/actions/invitations";

export function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    startTransition(async () => {
      const result = await inviteTeamMember({ email });
      if (result?.data?.success) {
        setMessage(`Kinde created an invitation for ${result.data.email}. They should receive an email with a secure sign-up link.`);
        setEmail("");
      } else if (result?.data && "error" in result.data) {
        setIsError(true);
        setMessage(result.data.error);
      } else {
        setIsError(true);
        setMessage(result?.serverError ?? "Could not send the invitation.");
      }
    });
  }

  return (
    <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={submit}>
      <label className="grid gap-1.5 text-sm text-slate-300" htmlFor="invite-email">
        Work email
        <Input
          autoComplete="email"
          className="bg-black/40 text-white"
          id="invite-email"
          maxLength={320}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          required
          type="email"
          value={email}
        />
      </label>
      <Button className="self-end" disabled={pending || !email.trim()} type="submit">
        {pending ? "Sending…" : "Send invitation"}
      </Button>
      {message && (
        <p aria-live="polite" className={`text-sm sm:col-span-2 ${isError ? "text-red-300" : "text-emerald-300"}`}>
          {message}
        </p>
      )}
      <p className="text-xs leading-relaxed text-slate-400 sm:col-span-2">
        Kinde emails a secure invitation link. New invitees join LINK as team members and complete their profile after signing in.
      </p>
    </form>
  );
}

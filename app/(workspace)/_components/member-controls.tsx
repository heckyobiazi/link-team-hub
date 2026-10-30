"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveMemberProfile, updateAvailability, updateMemberRole } from "@/app/actions/workspace";

const titleOptions = ["Team admin", "CEO", "Supervisor", "Team member", "Other"];
type AccessRole = "admin" | "executive" | "lead" | "member";

export function ProfileSetupForm({
  jobTitle = "",
  focus = "",
  onboarding = false,
}: {
  jobTitle?: string;
  focus?: string | null;
  onboarding?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(titleOptions.includes(jobTitle) ? jobTitle : jobTitle ? "Other" : "");
  const [otherTitle, setOtherTitle] = useState(titleOptions.includes(jobTitle) ? "" : jobTitle);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const jobTitle = title === "Other" ? otherTitle.trim() : title;
    setMessage("");
    startTransition(async () => {
      const result = await saveMemberProfile({
        jobTitle,
        focus: String(data.get("focus") ?? ""),
      });
      if (result?.data?.success) {
        setMessage("Profile saved.");
        router.refresh();
        if (onboarding) router.push("/dashboard");
      } else setMessage(result?.serverError ?? "Please choose a job title.");
    });
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Job title
        <Select onValueChange={(value) => setTitle(value ?? "")} value={title}>
          <SelectTrigger className="w-full bg-black/40 text-white"><SelectValue placeholder="Choose your job title" /></SelectTrigger>
          <SelectContent>{titleOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      {title === "Other" && (
        <label className="grid gap-1.5 text-sm text-slate-300">
          Your job title
          <Input className="bg-black/40 text-white" maxLength={120} onChange={(event) => setOtherTitle(event.target.value)} required value={otherTitle} />
        </label>
      )}
      <label className="grid gap-1.5 text-sm text-slate-300">
        Team focus (optional)
        <Input className="bg-black/40 text-white" defaultValue={focus ?? ""} maxLength={120} name="focus" placeholder="Operations, Engineering, Design…" />
      </label>
      <p className="text-xs text-slate-400">Your job title describes your role on the team. App access permissions are managed separately by an admin.</p>
      <div className="flex items-center gap-3">
        <Button disabled={pending || !title || (title === "Other" && !otherTitle.trim())} type="submit">
          {pending ? "Saving…" : onboarding ? "Finish setup" : "Save profile"}
        </Button>
        {message && <p aria-live="polite" className="text-sm text-slate-300">{message}</p>}
      </div>
    </form>
  );
}

export function MemberRoleSelect({
  memberId,
  role,
  disabled = false,
}: {
  memberId: string;
  role: AccessRole;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<AccessRole>(role);
  const [error, setError] = useState("");

  function change(nextRole: AccessRole) {
    const previous = value;
    setValue(nextRole);
    setError("");
    startTransition(async () => {
      const result = await updateMemberRole({ memberId, role: nextRole });
      if (result?.data?.success) router.refresh();
      else {
        setValue(previous);
        setError(result?.serverError ?? "Could not update access.");
      }
    });
  }

  return (
    <span className="grid gap-1">
      <Select disabled={disabled || pending} onValueChange={(next) => { if (next) change(next as AccessRole); }} value={value}>
        <SelectTrigger aria-label="Access role" className="w-36 bg-black/40 text-white"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="lead">Supervisor / lead</SelectItem>
          <SelectItem value="executive">Executive</SelectItem>
          <SelectItem value="admin">Team admin</SelectItem>
        </SelectContent>
      </Select>
      {error && <span aria-live="polite" className="max-w-36 text-xs text-red-300">{error}</span>}
    </span>
  );
}

export function AvailabilitySelect({ availability }: { availability: "available" | "in_meeting" | "away" }) {
  const router = useRouter();
  const [value, setValue] = useState(availability);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function change(next: "available" | "in_meeting" | "away") {
    const previous = value;
    setValue(next);
    setMessage("");
    startTransition(async () => {
      const result = await updateAvailability({ availability: next });
      if (result?.data?.success) router.refresh();
      else {
        setValue(previous);
        setMessage(result?.serverError ?? "Could not save availability.");
      }
    });
  }

  return (
    <div className="grid max-w-sm gap-2">
      <Select disabled={pending} onValueChange={(next) => { if (next) change(next as typeof value); }} value={value}>
        <SelectTrigger className="w-full bg-black/40 text-white"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="in_meeting">In a meeting</SelectItem>
          <SelectItem value="away">Away</SelectItem>
        </SelectContent>
      </Select>
      {message && <p aria-live="polite" className="text-xs text-red-300">{message}</p>}
    </div>
  );
}

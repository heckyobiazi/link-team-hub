"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject, createTask, updateTaskStatus } from "@/app/actions/workspace";

type Option = { id: string; name: string };

export function ProjectForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage("");
    startTransition(async () => {
      const result = await createProject({
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        dueDate: String(formData.get("dueDate") ?? ""),
      });
      if (result?.data?.success) {
        setMessage("Project created.");
        form.reset();
      } else setMessage(result?.serverError ?? "Please check the form and try again.");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm text-slate-300 sm:col-span-2">
        Project name
        <Input className="bg-black/40 text-white" maxLength={180} name="name" required />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300 sm:col-span-2">
        Description
        <Textarea className="bg-black/40 text-white" maxLength={3000} name="description" />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Due date
        <Input className="bg-black/40 text-white" name="dueDate" type="date" />
      </label>
      <div className="flex items-end gap-3">
        <Button disabled={pending} type="submit">{pending ? "Creating…" : "Create project"}</Button>
        {message && <p aria-live="polite" className="text-sm text-slate-300">{message}</p>}
      </div>
    </form>
  );
}

export function TaskForm({ projects, members }: { projects: Option[]; members: Option[] }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage("");
    startTransition(async () => {
      const result = await createTask({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        projectId,
        assigneeId,
        dueDate: String(formData.get("dueDate") ?? ""),
      });
      if (result?.data?.success) {
        setMessage("Task assigned.");
        form.reset();
      } else setMessage(result?.serverError ?? "Please check the form and try again.");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-2">
      <label className="grid gap-1.5 text-sm text-slate-300 lg:col-span-2">
        Task
        <Input className="bg-black/40 text-white" maxLength={240} name="title" required />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300 lg:col-span-2">
        Details (optional)
        <Textarea className="bg-black/40 text-white" maxLength={3000} name="description" />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Project
        <Select onValueChange={(value) => setProjectId(value ?? "")} value={projectId}>
          <SelectTrigger className="w-full bg-black/40 text-white"><SelectValue placeholder="Choose a project" /></SelectTrigger>
          <SelectContent>{projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Assign to
        <Select onValueChange={(value) => setAssigneeId(value ?? "")} value={assigneeId}>
          <SelectTrigger className="w-full bg-black/40 text-white"><SelectValue placeholder="Choose a team member" /></SelectTrigger>
          <SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Due date
        <Input className="bg-black/40 text-white" name="dueDate" type="date" />
      </label>
      <div className="flex items-end gap-3">
        <Button disabled={pending || !projects.length || !members.length || !projectId || !assigneeId} type="submit">
          {pending ? "Assigning…" : "Assign task"}
        </Button>
        {message && <p aria-live="polite" className="text-sm text-slate-300">{message}</p>}
      </div>
      {!projects.length && <p className="text-sm text-amber-300 lg:col-span-2">Create a project before assigning a task.</p>}
    </form>
  );
}

export function TaskStatusSelect({ id, status }: { id: string; status: "todo" | "in-progress" | "blocked" | "done" }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function update(nextStatus: "todo" | "in-progress" | "blocked" | "done") {
    setError("");
    startTransition(async () => {
      const result = await updateTaskStatus({ id, status: nextStatus });
      if (!result?.data?.success) setError(result?.serverError ?? "Could not update task.");
    });
  }

  return (
    <span className="grid gap-1">
      <Select disabled={pending} onValueChange={(value) => { if (value) update(value as typeof status); }} value={status}>
        <SelectTrigger aria-label="Task status" className="w-36 bg-black/40 text-white"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">To do</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
      {error && <span aria-live="polite" className="max-w-36 text-xs text-red-300">{error}</span>}
    </span>
  );
}

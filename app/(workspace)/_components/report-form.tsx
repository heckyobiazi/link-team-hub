"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteReport, saveReport } from "@/app/actions/workspace";

type ReportValue = {
  id: string;
  reportDate: string;
  completed: string;
  nextSteps: string;
  blockers: string | null;
  status: "draft" | "submitted";
};

export function ReportForm({ report }: { report?: ReportValue }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function save(submit: boolean) {
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    const data = new FormData(form);
    setMessage("");
    startTransition(async () => {
      const result = await saveReport({
        id: report?.id,
        reportDate: String(data.get("reportDate")),
        completed: String(data.get("completed")),
        nextSteps: String(data.get("nextSteps")),
        blockers: String(data.get("blockers") ?? ""),
        submit,
      });
      if (result?.data?.success) {
        setMessage(submit ? "Report submitted." : "Draft saved.");
        if (!report) form.reset();
        router.refresh();
      } else {
        setMessage(result?.serverError ?? "Please check the fields and try again.");
      }
    });
  }

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      {report && <input name="id" type="hidden" value={report.id} />}
      <label className="grid gap-1.5 text-sm text-slate-300">
        Report date
        <Input
          className="bg-black/40 text-white"
          defaultValue={report?.reportDate ?? new Date().toISOString().slice(0, 10)}
          name="reportDate"
          required
          type="date"
        />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        What did you complete?
        <Textarea
          className="min-h-24 bg-black/40 text-white"
          defaultValue={report?.completed ?? ""}
          maxLength={5000}
          name="completed"
          required
        />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        What are your next steps?
        <Textarea
          className="min-h-20 bg-black/40 text-white"
          defaultValue={report?.nextSteps ?? ""}
          maxLength={5000}
          name="nextSteps"
          required
        />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Blockers (optional)
        <Textarea
          className="min-h-16 bg-black/40 text-white"
          defaultValue={report?.blockers ?? ""}
          maxLength={3000}
          name="blockers"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={pending} onClick={() => save(false)} type="button" variant="outline">
          {pending ? "Saving…" : "Save draft"}
        </Button>
        <Button disabled={pending} onClick={() => save(true)} type="button">
          {pending ? "Saving…" : "Submit report"}
        </Button>
        {message && <p aria-live="polite" className="text-sm text-slate-300">{message}</p>}
      </div>
    </form>
  );
}

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function remove() {
    setError("");
    startTransition(async () => {
      const result = await deleteReport({ id });
      if (result?.data?.success) {
        setOpen(false);
        router.refresh();
      }
      else setError(result?.serverError ?? "Could not delete this report.");
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogTrigger render={<Button disabled={pending} size="sm" type="button" variant="destructive">Delete</Button>} />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes your report.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={remove} variant="destructive">
              {pending ? "Deleting…" : "Delete report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && <span aria-live="polite" className="text-xs text-red-300">{error}</span>}
    </span>
  );
}

"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="grid min-h-[50vh] place-items-center text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-white">This page could not load</h1>
        <p className="mt-2 text-sm text-slate-400">The error was reported. Try loading the page again.</p>
        <Button className="mt-5" onClick={reset} type="button">Try again</Button>
      </div>
    </main>
  );
}

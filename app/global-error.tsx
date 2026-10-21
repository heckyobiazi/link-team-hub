"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-black p-6 text-center text-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">
            The error has been reported. Please try again.
          </p>
        </div>
      </body>
    </html>
  );
}

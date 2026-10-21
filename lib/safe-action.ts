import { createSafeActionClient } from "next-safe-action";
import * as Sentry from "@sentry/node";
import { z } from "zod";

export const actionClient = createSafeActionClient({
    defineMetadataSchema() {
        return z.object({
            userId: z.string().uuid(),
        });
    },
    handleServerError(e) {
        Sentry.captureException(e);
    }
});
import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <PageHeader
      title="Notifications"
      description="Get a nudge when something needs your attention."
    />
  );
}

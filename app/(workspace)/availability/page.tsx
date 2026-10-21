import type { Metadata } from "next";
import { PageHeader } from "../_components/page-header";

export const metadata: Metadata = { title: "Availability" };

export default function AvailabilityPage() {
  return (
    <PageHeader
      title="Availability"
      description="Share when you are available, on your terms."
    />
  );
}

import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";

export const metadata: Metadata = { title: "Management Overview" };

export default async function OverviewPage() {
  await requireRole(["lead", "executive", "admin"]);

  return (
    <PageHeader
      title="Management Overview"
      description="Get the big picture, without losing the details."
    />
  );
}

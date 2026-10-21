import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, AuthFooter } from "../_components/auth-ui";

export const metadata: Metadata = { title: "Access denied | LINK Team Hub" };

export default function AccessDeniedPage() {
  return (
    <AuthCard
      title="Access denied"
      description="Your account does not have permission to view this page. Ask a team admin if you need access."
    >
      <AuthFooter>
        <Link href="/dashboard">Back to dashboard</Link> ·{" "}
        <Link href="/login">Switch account</Link>
      </AuthFooter>
    </AuthCard>
  );
}

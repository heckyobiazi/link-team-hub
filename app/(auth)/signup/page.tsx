import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthCard,
  AuthField,
  AuthFooter,
  AuthSubmit,
} from "../_components/auth-ui";

export const metadata: Metadata = {
  title: "Sign up | LINK Team Hub",
};

async function continueWithInvite(formData: FormData) {
  "use server";

  const invitationCode = String(formData.get("invitationCode") ?? "").trim();
  if (!invitationCode || invitationCode.length > 512) redirect("/signup");

  const params = new URLSearchParams({
    invitation_code: invitationCode,
    is_invitation: "true",
    post_login_redirect_url: "/onboarding",
  });

  redirect(`/api/auth/register?${params.toString()}`);
}

export default function SignupPage() {
  return (
    <>
      <div aria-hidden className="login-atmosphere fixed inset-0 z-0" />
      <AuthCard
        title="Create your account"
        description="Enter the invitation code provided by your LINK team."
        variant="glass"
      >
        <form action={continueWithInvite} className="grid gap-4">
          <AuthField
            autoComplete="off"
            id="invitationCode"
            label="Invitation code"
            maxLength={512}
            required
          />
          <p className="text-xs leading-relaxed text-slate-400">
            Kinde will verify the code before creating your account. Ask a LINK team admin if you need an invitation.
          </p>
          <AuthSubmit>Continue to sign up</AuthSubmit>
        </form>
        <AuthFooter>
          Already have an account? <Link href="/login">Log in</Link>
        </AuthFooter>
      </AuthCard>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { AuthCard, AuthFooter, authButtonClass } from "../_components/auth-ui";

export const metadata: Metadata = {
  title: "Sign up | LINK Team Hub",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Get your team on the same page."
    >
      <RegisterLink
        className={authButtonClass}
        postLoginRedirectURL="/dashboard"
      >
        Continue to sign up
      </RegisterLink>
      <AuthFooter>
        Already have an account? <Link href="/login">Log in</Link>
      </AuthFooter>
    </AuthCard>
  );
}

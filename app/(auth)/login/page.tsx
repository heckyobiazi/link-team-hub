import type { Metadata } from "next";
import Link from "next/link";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { AuthCard, AuthFooter, authButtonClass } from "../_components/auth-ui";

export const metadata: Metadata = {
  title: "Log in | LINK Team Hub",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Log in"
      description="Welcome back. Log in to your team hub."
    >
      <LoginLink
        className={authButtonClass}
        postLoginRedirectURL="/dashboard"
      >
        Continue to log in
      </LoginLink>
      <AuthFooter>
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </AuthFooter>
    </AuthCard>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProfileSetupForm } from "../(workspace)/_components/member-controls";
import LoadingPage from "../loadingpage";

export const metadata = { title: "Set up your profile | LINK Team Hub" };

async function OnboardingContent() {
  const user = await getCurrentUser({ allowIncomplete: true });
  if (user.jobTitle) redirect("/dashboard");

  return (
    <main className="grid min-h-dvh place-items-center bg-black px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-blue-900/70 bg-slate-950 p-6 shadow-2xl shadow-blue-950/30 sm:p-10">
        <Link className="text-xl font-semibold tracking-tight text-white" href="/">LINK</Link>
        <h1 className="mt-8 text-2xl font-semibold">Set up your team profile</h1>
        <p className="mt-2 mb-6 text-sm text-slate-400">
          Welcome, {user.name}. Choose the title your teammates should see.
        </p>
        <ProfileSetupForm onboarding />
      </section>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingPage fullScreen label="Loading profile setup…" />}>
      <OnboardingContent />
    </Suspense>
  );
}

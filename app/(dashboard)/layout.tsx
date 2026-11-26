import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/src/auth/server";
import Loading from "./loading";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}

async function AuthenticatedDashboard({ children }: { children: ReactNode }) {
  const { data: session } = await getSession();
  if (!session?.user) redirect("/sign-in");

  return (
    <AppShell userName={session.user.name || session.user.email} userEmail={session.user.email} userImage={session.user.image}>
      {children}
    </AppShell>
  );
}

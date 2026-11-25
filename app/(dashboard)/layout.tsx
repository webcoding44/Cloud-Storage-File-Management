import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StoragePanel } from "@/components/storage/StoragePanel";
import { getCurrentUser } from "@/services/drive.service";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AppShell userName={user.name} aside={<StoragePanel />}>
      {children}
    </AppShell>
  );
}

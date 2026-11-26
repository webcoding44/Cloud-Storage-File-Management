"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  /** Right-hand panel (e.g. cloud storage summary) */
  aside?: ReactNode;
  children: ReactNode;
}

export function AppShell({ userName, userEmail, userImage, aside, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="grid h-dvh w-full grid-cols-1 overflow-hidden bg-surface lg:grid-cols-[272px_minmax(0,1fr)] min-[1200px]:grid-cols-[272px_minmax(0,1fr)_400px]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} userName={userName} userEmail={userEmail} userImage={userImage} />

      <div className="dashboard-workspace flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 xl:px-8 xl:py-7">{children}</main>

          {aside && (
            <aside
              aria-label="Storage overview"
              className="hidden min-h-0 w-[400px] shrink-0 overflow-y-auto border-l border-zinc-100 min-[1200px]:block"
            >
              {aside}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

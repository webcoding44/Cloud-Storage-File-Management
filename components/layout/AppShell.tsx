"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  userName: string;
  /** Right-hand panel (e.g. cloud storage summary) */
  aside?: ReactNode;
  children: ReactNode;
}

export function AppShell({ userName, aside, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-surface lg:p-5">
      <div className="flex w-full overflow-hidden bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-zinc-300/40">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar userName={userName} onMenuClick={() => setSidebarOpen(true)} />

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
            <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 xl:overflow-y-auto">{children}</main>

            {aside && (
              <aside
                aria-label="Storage overview"
                className="w-full shrink-0 border-t border-zinc-100 xl:w-[340px] xl:overflow-y-auto xl:border-l xl:border-t-0"
              >
                {aside}
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

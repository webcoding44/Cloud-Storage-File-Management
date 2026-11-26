"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  children: ReactNode;
}

export function AppShell({ userName, userEmail, userImage, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`dashboard-shell grid h-dvh w-full grid-cols-1 overflow-hidden bg-surface transition-[grid-template-columns] duration-300 ease-in-out motion-reduce:transition-none ${sidebarCollapsed ? "md:grid-cols-[76px_minmax(0,1fr)]" : "md:grid-cols-[272px_minmax(0,1fr)]"}`}>
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
      />

      <div className="dashboard-workspace flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-10 sm:px-6 xl:px-8 xl:pb-7 xl:pt-10">{children}</main>

        </div>
      </div>
    </div>
  );
}

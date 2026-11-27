"use client";

import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV, isNavItemActive } from "@/constants/navigation";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { Brand } from "./Brand";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "sidebar-shell fixed inset-y-0 left-0 z-50 flex h-dvh w-[272px] shrink-0 flex-col overflow-visible bg-sidebar px-4 py-5 shadow-[12px_0_36px_rgba(12,10,24,0.12)] transition-[width,transform,padding] duration-300 ease-in-out md:static md:translate-x-0 motion-reduce:transition-none",
          collapsed && "sidebar-is-collapsed md:w-[76px] md:items-center md:px-2",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("sidebar-brand-wrap flex shrink-0 items-center px-1", collapsed ? "h-[76px] flex-col justify-center gap-2" : "h-11 justify-between")}>
          <Brand />
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sidebar-collapse-toggle hidden size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 md:grid"
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
          </button>
        </div>

        <nav aria-label="Main navigation" className="mt-12 flex min-h-0 flex-col gap-1">
          {PRIMARY_NAV.map((item) => (
            <SidebarNavItem key={item.href} item={item} active={isNavItemActive(item, pathname)} onNavigate={onClose} />
          ))}
        </nav>

        <div className="sidebar-illustration-slot flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <AuthIllustration />
        </div>
      </aside>
    </>
  );
}

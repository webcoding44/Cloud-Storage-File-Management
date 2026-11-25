"use client";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV, isNavItemActive } from "@/constants/navigation";
import { Brand } from "./Brand";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function Sidebar({ open, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-sidebar px-4 py-6 transition-transform duration-200",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Brand />

        <nav aria-label="Main navigation" className="mt-10 flex flex-1 flex-col gap-1.5">
          {PRIMARY_NAV.map((item) => (
            <SidebarNavItem key={item.href} item={item} active={isNavItemActive(item, pathname)} onNavigate={onClose} />
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-[18px]" />
          Logout
        </button>
      </aside>
    </>
  );
}

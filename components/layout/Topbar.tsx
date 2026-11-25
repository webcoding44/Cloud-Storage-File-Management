"use client";

import { Bell, HelpCircle, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "./SearchInput";

interface TopbarProps {
  userName: string;
  onMenuClick: () => void;
}

export function Topbar({ userName, onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-zinc-100 bg-white px-4 sm:px-6">
      <IconButton label="Open menu" onClick={onMenuClick} className="lg:hidden">
        <Menu className="size-5" />
      </IconButton>

      {/* Keyed by pathname so the input resets when navigating between pages */}
      <Suspense fallback={<div className="h-10 w-full max-w-xs rounded-lg bg-zinc-100" />}>
        <SearchInput key={pathname} />
      </Suspense>

      <div className="ml-auto flex items-center gap-1">
        <IconButton label="Help" className="hidden sm:inline-flex">
          <HelpCircle className="size-[18px]" />
        </IconButton>
        <IconButton label="Settings">
          <Settings className="size-[18px]" />
        </IconButton>
        <IconButton label="Notifications" badge>
          <Bell className="size-[18px]" />
        </IconButton>
        <button type="button" aria-label={`Account: ${userName}`} className="ml-2 rounded-full">
          <Avatar name={userName} />
        </button>
      </div>
    </div>
  );
}

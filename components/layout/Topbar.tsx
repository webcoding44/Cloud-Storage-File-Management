"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-zinc-100 bg-white px-4 sm:px-6">
      <IconButton label="Open menu" onClick={onMenuClick} className="lg:hidden">
        <Menu className="size-5" />
      </IconButton>

      {/* Keyed by pathname so the input resets when navigating between pages */}
      <Suspense fallback={<div className="h-11 w-full max-w-md rounded-xl bg-zinc-100" />}>
        <SearchInput key={pathname} />
      </Suspense>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}

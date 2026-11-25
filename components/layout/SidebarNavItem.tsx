import Link from "next/link";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/constants/navigation";

interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({ item, active, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/30"
          : "text-zinc-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="size-[18px]" />
      {item.label}
    </Link>
  );
}

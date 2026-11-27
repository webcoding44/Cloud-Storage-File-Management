import Link from "next/link";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/constants/navigation";

interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  menuItem?: boolean;
}

export function SidebarNavItem({ item, active, onNavigate, menuItem = false }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      role={menuItem ? "menuitem" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "sidebar-nav-link group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none",
        active
          ? "bg-sidebar-active text-white shadow-sm shadow-black/10"
          : "text-sidebar-muted hover:bg-white/[0.08] hover:text-white",
      )}
    >
      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-300" />}
      <Icon className={cn("sidebar-nav-icon size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-[1.04]", active && "text-brand-100", "motion-reduce:transition-none motion-reduce:transform-none")} />
      <span className="sidebar-nav-label">{item.label}</span>
    </Link>
  );
}

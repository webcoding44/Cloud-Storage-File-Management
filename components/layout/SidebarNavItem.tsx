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
        "sidebar-nav-link group relative flex h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold transition-[background,color,transform,box-shadow] duration-300 ease-out hover:translate-x-[3px] hover:shadow-lg hover:shadow-brand-950/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none",
        active
          ? "bg-gradient-to-r from-brand-600/90 via-brand-600/80 to-brand-700/70 text-white shadow-md shadow-brand-950/25"
          : "text-zinc-400 hover:bg-gradient-to-r hover:from-brand-500/15 hover:to-brand-700/10 hover:text-white",
      )}
    >
      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-300" />}
      <Icon className={cn("sidebar-nav-icon size-5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3", active && "text-brand-100", "motion-reduce:transition-none")} />
      <span className="sidebar-nav-label">{item.label}</span>
    </Link>
  );
}

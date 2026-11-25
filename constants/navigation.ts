import { Clock, Folder, Star, Trash2, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "My Drive", href: "/", icon: Folder },
  { label: "Shared with Me", href: "/shared", icon: Users },
  { label: "Recent", href: "/recent", icon: Clock },
  { label: "Favourite", href: "/favourites", icon: Star },
  { label: "Trash", href: "/trash", icon: Trash2 },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

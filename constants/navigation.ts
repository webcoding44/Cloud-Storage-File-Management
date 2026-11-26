import { AudioLines, Clapperboard, FileStack, FolderArchive, Images, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Images", href: "/images", icon: Images },
  { label: "Video", href: "/video", icon: Clapperboard },
  { label: "Audio", href: "/audio", icon: AudioLines },
  { label: "Files", href: "/files", icon: FileStack },
  { label: "Other Files", href: "/other-files", icon: FolderArchive },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

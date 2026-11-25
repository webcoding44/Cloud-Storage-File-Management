import type { DriveItem } from "@/types/drive";

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function formatBytes(bytes: number): string {
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const fractionDigits = unitIndex === 0 ? 0 : unitIndex >= 3 ? 2 : value >= 100 ? 0 : 1;
  return `${value.toFixed(fractionDigits)} ${BYTE_UNITS[unitIndex]}`;
}

/** Deterministic (timezone-independent) date formatting, e.g. "28 Mar 2025". */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatFileCount(count: number): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? "File" : "Files"}`;
}

export function formatItemMeta(item: DriveItem): string {
  const count = item.kind === "folder" ? item.itemCount ?? 0 : 1;
  return `${formatFileCount(count)} | ${formatBytes(item.sizeBytes)}`;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

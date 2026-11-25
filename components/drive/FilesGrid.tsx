import { Star } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/format";
import type { DriveItem } from "@/types/drive";
import { FileTypeIcon } from "./FileTypeIcon";

export function FilesGrid({ items }: { items: DriveItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="relative flex w-full flex-col items-center rounded-xl border border-zinc-200 bg-white p-4 text-center transition-colors hover:border-brand-200 hover:bg-brand-50/40"
          >
            {item.starred && <Star aria-label="Starred" className="absolute right-3 top-3 size-4 fill-amber-400 text-amber-400" />}
            <FileTypeIcon kind={item.kind} size="lg" />
            <span className="mt-3 w-full truncate text-sm font-medium text-zinc-900">{item.name}</span>
            <span className="mt-0.5 text-xs text-zinc-400">
              {formatDate(item.modifiedAt)} · {formatBytes(item.sizeBytes)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

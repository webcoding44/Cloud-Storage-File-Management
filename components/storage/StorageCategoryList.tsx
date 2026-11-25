import { FileText, FileArchive, Image as ImageIcon, Music, Video, type LucideIcon } from "lucide-react";
import { formatBytes, formatFileCount } from "@/lib/format";
import type { StorageCategoryId, StorageCategorySummary } from "@/types/drive";

const CATEGORY_ICONS: Record<StorageCategoryId, LucideIcon> = {
  documents: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
  zip: FileArchive,
};

export function StorageCategoryList({ categories }: { categories: StorageCategorySummary[] }) {
  return (
    <ul className="space-y-3">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.id];

        return (
          <li
            key={category.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-brand-200"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900">{category.label}</p>
              <p className="text-xs text-zinc-400">
                {formatFileCount(category.fileCount)} | {formatBytes(category.sizeBytes)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { FileText, FileArchive, Image as ImageIcon, Music, Video, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MOTION } from "@/components/motion/tokens";
import { formatBytes, formatFileCount } from "@/lib/format";
import type { StorageCategoryId, StorageCategorySummary } from "@/types/drive";

const CATEGORY_ICONS: Record<StorageCategoryId, LucideIcon> = {
  documents: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
  zip: FileArchive,
};

const CATEGORY_TONES: Record<StorageCategoryId, string> = {
  documents: "bg-category-document-soft text-category-document",
  image: "bg-category-image-soft text-category-image",
  video: "bg-category-video-soft text-category-video",
  audio: "bg-category-audio-soft text-category-audio",
  zip: "bg-category-other-soft text-category-other",
};

const CATEGORY_COLORS: Record<StorageCategoryId, string> = {
  documents: "var(--category-document)",
  image: "var(--category-image)",
  video: "var(--category-video)",
  audio: "var(--category-audio)",
  zip: "var(--category-other)",
};

export function StorageCategoryList({ categories, totalBytes }: { categories: StorageCategorySummary[]; totalBytes: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <ul className="space-y-1.5">
      {categories.map((category, index) => {
        const Icon = CATEGORY_ICONS[category.id];
        const percentage = totalBytes > 0 ? Math.min(100, category.sizeBytes / totalBytes * 100) : 0;

        return (
          <li
            key={category.id}
            className="flex min-h-12 items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-50"
          >
            <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${CATEGORY_TONES[category.id]}`}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-zinc-800">{category.label}</p>
                <p className="shrink-0 text-[11px] font-semibold text-zinc-700">{formatBytes(category.sizeBytes)}</p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="w-14 shrink-0 text-[10px] text-zinc-400">{formatFileCount(category.fileCount)}</p>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category.id] }} initial={reduceMotion ? false : { width: 0 }} whileInView={{ width: `${percentage}%` }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0 : MOTION.chart, delay: reduceMotion ? 0 : index * MOTION.stagger, ease: MOTION.easing }} />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

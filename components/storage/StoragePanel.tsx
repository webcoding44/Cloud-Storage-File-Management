"use client";

import { Cloud } from "lucide-react";
import { StorageCategoryList } from "./StorageCategoryList";
import { StorageGauge } from "./StorageGauge";
import type { StorageCategoryId, StorageCategorySummary } from "@/types/drive";
import { formatBytes } from "@/lib/format";
import { useStorageStats } from "./useStorageStats";

const CATEGORY_IDS: Record<string, StorageCategoryId> = {
  images: "image",
  videos: "video",
  audio: "audio",
  documents: "documents",
  "other-files": "zip",
};

const CATEGORY_LABELS: Record<StorageCategoryId, string> = {
  image: "Images",
  video: "Videos",
  audio: "Audio",
  documents: "Documents",
  zip: "Other files",
};

export function StoragePanel() {
  const { stats, error, loading } = useStorageStats();
  const categories: StorageCategorySummary[] = (stats?.personal.categories ?? []).flatMap((category) => {
    const id = CATEGORY_IDS[category.category];
    if (!id) return [];
    return {
      id,
      label: CATEGORY_LABELS[id],
      fileCount: category.fileCount,
      sizeBytes: category.totalBytes,
    };
  });
  const projectPool = stats?.projectPool;
  const personal = stats?.personal;

  return (
    <div className="space-y-3.5 p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Cloud className="size-[18px]" /></span>
        <div><h2 className="text-sm font-semibold text-zinc-900">Neon Object Storage</h2><p className="mt-0.5 text-[11px] text-zinc-500">Shared project storage pool</p></div>
      </div>
      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      ) : (
        <>
          {projectPool ? (
            <StorageGauge usedBytes={projectPool.usedBytes} totalBytes={projectPool.capacityBytes} caption="shared project capacity" />
          ) : (
            <div className="grid min-h-32 place-items-center text-xs text-zinc-400" role="status">
              {loading ? "Loading shared storage…" : "Storage usage unavailable"}
            </div>
          )}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-50 p-2.5 text-center">
            <div><p className="text-[10px] font-medium text-zinc-400">Project used</p><p className="mt-1 text-xs font-semibold text-zinc-800">{projectPool ? formatBytes(projectPool.usedBytes) : loading ? "…" : "—"}</p></div>
            <div className="border-x border-zinc-200"><p className="text-[10px] font-medium text-zinc-400">Capacity</p><p className="mt-1 text-xs font-semibold text-zinc-800">{projectPool ? formatBytes(projectPool.capacityBytes) : loading ? "…" : "—"}</p></div>
            <div><p className="text-[10px] font-medium text-zinc-400">Available</p><p className="mt-1 text-xs font-semibold text-zinc-800">{projectPool ? formatBytes(projectPool.remainingBytes) : loading ? "…" : "—"}</p></div>
          </div>
          <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            Your files: <span className="font-semibold text-zinc-800">{personal ? formatBytes(personal.usedBytes) : loading ? "…" : "—"}</span>
            <span className="text-zinc-400"> · </span>
            <span className="font-semibold text-zinc-800">{personal?.fileCount ?? (loading ? "…" : "—")}</span> files
          </p>
          <section aria-labelledby="storage-category-title">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h3 id="storage-category-title" className="text-sm font-semibold text-zinc-900">Storage by Category</h3>
              <span className="text-[10px] text-zinc-400">{personal ? `${personal.fileCount} active files` : loading ? "Loading…" : "—"}</span>
            </div>
            <StorageCategoryList categories={categories} totalBytes={personal?.usedBytes ?? 0} />
          </section>
        </>
      )}
    </div>
  );
}

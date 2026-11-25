"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSortedItems } from "@/hooks/useSortedItems";
import type { DriveItem, ViewMode } from "@/types/drive";
import { FilesGrid } from "./FilesGrid";
import { FilesTable } from "./FilesTable";
import { ViewToggle } from "./ViewToggle";

interface FilesExplorerProps {
  title: string;
  items: DriveItem[];
  currentUserId: string;
  emptyTitle: string;
  emptyDescription?: string;
}

export function FilesExplorer({ title, items, currentUserId, emptyTitle, emptyDescription }: FilesExplorerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { sort, sortedItems, toggleSort } = useSortedItems(items);

  return (
    <section aria-label={title} className="mt-8">
      <SectionHeader title={title} action={<ViewToggle value={viewMode} onChange={setViewMode} />} />

      {sortedItems.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : viewMode === "list" ? (
        <FilesTable items={sortedItems} currentUserId={currentUserId} sort={sort} onSort={toggleSort} />
      ) : (
        <FilesGrid items={sortedItems} />
      )}
    </section>
  );
}

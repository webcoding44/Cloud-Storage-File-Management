"use client";

import { useCallback, useMemo, useState } from "react";
import type { DriveItem, SortKey, SortState } from "@/types/drive";

const COMPARATORS: Record<SortKey, (a: DriveItem, b: DriveItem) => number> = {
  name: (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  owner: (a, b) => a.owner.name.localeCompare(b.owner.name, "en", { sensitivity: "base" }),
  modifiedAt: (a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime(),
  sizeBytes: (a, b) => a.sizeBytes - b.sizeBytes,
};

export function useSortedItems(items: DriveItem[], initial: SortState = { key: "modifiedAt", direction: "desc" }) {
  const [sort, setSort] = useState<SortState>(initial);

  const sortedItems = useMemo(() => {
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...items].sort((a, b) => COMPARATORS[sort.key](a, b) * factor);
  }, [items, sort]);

  const toggleSort = useCallback((key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }, []);

  return { sort, sortedItems, toggleSort };
}

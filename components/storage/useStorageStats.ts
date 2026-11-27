"use client";

import { useEffect, useState } from "react";
import { filesUpdatedEvent } from "@/src/files-updated";

export interface StorageCategoryStats {
  category: string;
  fileCount: number;
  totalBytes: number;
}

export interface StorageHistoryBucket {
  label: string;
  fileCount: number;
  totalBytes: number;
}

export interface StorageStats {
  projectPool: {
    capacityBytes: number;
    usedBytes: number;
    remainingBytes: number;
    usagePercent: number;
  };
  personal: {
    usedBytes: number;
    fileCount: number;
    uploadedThisMonth: number;
    lastUploadedAt: string | null;
    categories: StorageCategoryStats[];
    history: {
      sixMonths: StorageHistoryBucket[];
      last30Days: StorageHistoryBucket[];
    };
  };
}

export function useStorageStats() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const response = await fetch("/api/files/stats", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load storage statistics.");
        if (active) {
          setStats(result as StorageStats);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load storage statistics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadStats();
    window.addEventListener(filesUpdatedEvent, loadStats);
    return () => {
      active = false;
      window.removeEventListener(filesUpdatedEvent, loadStats);
    };
  }, []);

  return { stats, error, loading };
}

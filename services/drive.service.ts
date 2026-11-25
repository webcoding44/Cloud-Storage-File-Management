import { CURRENT_USER, MOCK_ITEMS, MOCK_PROVIDERS, MOCK_STORAGE_OVERVIEW } from "@/data/mock-drive";
import type { DriveItem, DriveOwner, DriveView, StorageOverview, StorageProvider } from "@/types/drive";

/**
 * Data-access layer for the drive.
 *
 * Every function is async and returns plain typed data, so the mock
 * implementations below can be swapped for real DB / API calls without
 * touching any UI component.
 */

export interface GetFilesParams {
  view: DriveView;
  query?: string;
}

const byModifiedDesc = (a: DriveItem, b: DriveItem) =>
  new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();

const VIEW_PREDICATES: Record<DriveView, (item: DriveItem) => boolean> = {
  "my-drive": (item) => !item.trashed && item.owner.id === CURRENT_USER.id,
  shared: (item) => !item.trashed && item.owner.id !== CURRENT_USER.id,
  recent: (item) => !item.trashed,
  favourites: (item) => !item.trashed && item.starred,
  trash: (item) => item.trashed,
};

export async function getCurrentUser(): Promise<DriveOwner> {
  return CURRENT_USER;
}

export async function getFiles({ view, query }: GetFilesParams): Promise<DriveItem[]> {
  const normalizedQuery = query?.trim().toLowerCase();

  const items = MOCK_ITEMS.filter(VIEW_PREDICATES[view]).filter(
    (item) => !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery),
  );

  return items.sort(byModifiedDesc);
}

export async function getRecentUploads(limit = 6): Promise<DriveItem[]> {
  return MOCK_ITEMS.filter(VIEW_PREDICATES.recent).sort(byModifiedDesc).slice(0, limit);
}

export async function getStorageProviders(): Promise<StorageProvider[]> {
  return MOCK_PROVIDERS;
}

export async function getStorageOverview(): Promise<StorageOverview> {
  return MOCK_STORAGE_OVERVIEW;
}

export type FileKind =
  | "folder"
  | "document"
  | "spreadsheet"
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "other";

export type DriveView = "my-drive" | "shared" | "recent" | "favourites" | "trash";

export interface DriveOwner {
  id: string;
  name: string;
}

export interface DriveItem {
  id: string;
  name: string;
  kind: FileKind;
  owner: DriveOwner;
  /** ISO-8601 date string */
  modifiedAt: string;
  sizeBytes: number;
  /** Only relevant for folders */
  itemCount?: number;
  starred: boolean;
  trashed: boolean;
}

export type ProviderId = "google-drive" | "one-drive" | "mega" | "dropbox";
export type ProgressTone = "green" | "blue" | "red" | "sky";

export interface StorageProvider {
  id: ProviderId;
  name: string;
  fileCount: number;
  usedBytes: number;
  totalBytes: number;
  tone: ProgressTone;
}

export type StorageCategoryId = "documents" | "image" | "video" | "audio" | "zip";

export interface StorageCategorySummary {
  id: StorageCategoryId;
  label: string;
  fileCount: number;
  sizeBytes: number;
}

export interface StorageOverview {
  usedBytes: number;
  totalBytes: number;
  categories: StorageCategorySummary[];
}

export type SortKey = "name" | "owner" | "modifiedAt" | "sizeBytes";
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export type ViewMode = "list" | "grid";

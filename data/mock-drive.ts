import type { DriveItem, DriveOwner, StorageOverview, StorageProvider } from "@/types/drive";

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export const CURRENT_USER: DriveOwner = { id: "u-me", name: "Alex Morgan" };
const JENNIFER: DriveOwner = { id: "u-jen", name: "Jennifer" };

export const MOCK_ITEMS: DriveItem[] = [
  { id: "f-01", name: "UI Kits - Landing Page", kind: "folder", owner: CURRENT_USER, modifiedAt: "2025-05-20T09:00:00Z", sizeBytes: 2.24 * GB, itemCount: 12, starred: true, trashed: false },
  { id: "f-02", name: "Xandar Brief.docx", kind: "document", owner: CURRENT_USER, modifiedAt: "2025-05-19T10:30:00Z", sizeBytes: 8.1 * MB, starred: false, trashed: false },
  { id: "f-03", name: "Recording final.mp4", kind: "video", owner: CURRENT_USER, modifiedAt: "2025-05-18T18:10:00Z", sizeBytes: 164 * MB, starred: false, trashed: false },
  { id: "f-04", name: "Velocity-song.mp3", kind: "audio", owner: CURRENT_USER, modifiedAt: "2025-05-18T08:45:00Z", sizeBytes: 1.4 * MB, starred: false, trashed: false },
  { id: "f-05", name: "Project Xandar Moodboard", kind: "folder", owner: CURRENT_USER, modifiedAt: "2025-05-17T14:20:00Z", sizeBytes: 10.24 * GB, itemCount: 4, starred: false, trashed: false },
  { id: "f-06", name: "CV-Personal-Creative.jpeg", kind: "image", owner: CURRENT_USER, modifiedAt: "2025-05-17T11:05:00Z", sizeBytes: 2.3 * MB, starred: true, trashed: false },
  { id: "f-07", name: "Color moodboard Xandar", kind: "folder", owner: CURRENT_USER, modifiedAt: "2025-03-28T12:00:00Z", sizeBytes: 5.1 * MB, itemCount: 7, starred: false, trashed: false },
  { id: "f-08", name: "Component-library-documentation.fig", kind: "document", owner: CURRENT_USER, modifiedAt: "2025-04-12T16:40:00Z", sizeBytes: 24.1 * MB, starred: false, trashed: false },
  { id: "f-09", name: "Design-system-documentation.docx", kind: "document", owner: JENNIFER, modifiedAt: "2025-05-15T09:15:00Z", sizeBytes: 1.2 * MB, starred: false, trashed: false },
  { id: "f-10", name: "User-research-xandar.xlsx", kind: "spreadsheet", owner: JENNIFER, modifiedAt: "2025-05-16T13:30:00Z", sizeBytes: 645 * KB, starred: true, trashed: false },
  { id: "f-11", name: "Brand-assets.zip", kind: "archive", owner: CURRENT_USER, modifiedAt: "2025-02-11T08:00:00Z", sizeBytes: 148 * MB, starred: false, trashed: false },
  { id: "f-12", name: "Pitch-deck-2025.pdf", kind: "pdf", owner: JENNIFER, modifiedAt: "2025-04-02T10:00:00Z", sizeBytes: 12.6 * MB, starred: false, trashed: false },
  { id: "f-13", name: "Team-photo.png", kind: "image", owner: JENNIFER, modifiedAt: "2025-03-01T15:25:00Z", sizeBytes: 3.8 * MB, starred: false, trashed: false },
  { id: "f-14", name: "Product-demo.mov", kind: "video", owner: CURRENT_USER, modifiedAt: "2025-01-20T19:00:00Z", sizeBytes: 612 * MB, starred: false, trashed: true },
  { id: "f-15", name: "Old-invoice.pdf", kind: "pdf", owner: CURRENT_USER, modifiedAt: "2024-12-08T07:30:00Z", sizeBytes: 420 * KB, starred: false, trashed: true },
];

export const MOCK_PROVIDERS: StorageProvider[] = [
  { id: "google-drive", name: "Google Drive", fileCount: 1012, usedBytes: 88 * GB, totalBytes: 100 * GB, tone: "green" },
  { id: "one-drive", name: "One Drive", fileCount: 1012, usedBytes: 56 * GB, totalBytes: 100 * GB, tone: "sky" },
  { id: "mega", name: "Mega Drive", fileCount: 1012, usedBytes: 30 * GB, totalBytes: 100 * GB, tone: "red" },
  { id: "dropbox", name: "Drop Box", fileCount: 1012, usedBytes: 92 * GB, totalBytes: 100 * GB, tone: "blue" },
];

export const MOCK_STORAGE_OVERVIEW: StorageOverview = {
  usedBytes: 66.12 * GB,
  totalBytes: 100 * GB,
  categories: [
    { id: "documents", label: "Documents", fileCount: 870, sizeBytes: 6.2 * GB },
    { id: "image", label: "Image", fileCount: 1150, sizeBytes: 18.3 * GB },
    { id: "video", label: "Video", fileCount: 320, sizeBytes: 28.45 * GB },
    { id: "audio", label: "Audio", fileCount: 430, sizeBytes: 10.25 * GB },
    { id: "zip", label: "ZIP", fileCount: 95, sizeBytes: 2.92 * GB },
  ],
};

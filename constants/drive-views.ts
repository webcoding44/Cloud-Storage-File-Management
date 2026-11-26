import type { DriveView } from "@/types/drive";

export interface DriveViewConfig {
  title: string;
  description: string;
  listTitle: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const DRIVE_VIEWS: Record<DriveView, DriveViewConfig> = {
  "my-drive": {
    title: "Dashboard",
    description: "All the files and folders you own.",
    listTitle: "All Files",
    emptyTitle: "No files found",
    emptyDescription: "Upload a file or create a folder to get started.",
  },
  images: { title: "Images", description: "All your image files in one place.", listTitle: "Image Files", emptyTitle: "No images yet", emptyDescription: "Images you upload will appear here." },
  video: { title: "Video", description: "Your video files, gathered in one place.", listTitle: "Video Files", emptyTitle: "No videos yet", emptyDescription: "Videos you upload will appear here." },
  files: { title: "Files", description: "Documents, spreadsheets and PDFs.", listTitle: "Documents & Files", emptyTitle: "No files yet", emptyDescription: "Documents and other standard files will appear here." },
  "other-files": { title: "Other Files", description: "Archives and other file types.", listTitle: "Other Files", emptyTitle: "No other files yet", emptyDescription: "Archive and other file types will appear here." },
  audio: { title: "Audio", description: "Your audio files in one place.", listTitle: "Audio Files", emptyTitle: "No audio files yet", emptyDescription: "Audio files you upload will appear here." },
  shared: {
    title: "Shared",
    description: "Files and folders other people shared with you.",
    listTitle: "Shared Files",
    emptyTitle: "Nothing shared with you yet",
    emptyDescription: "When someone shares a file with you, it will show up here.",
  },
  recent: {
    title: "Recent",
    description: "Files you opened or edited lately.",
    listTitle: "Recent Files",
    emptyTitle: "No recent activity",
    emptyDescription: "Files you work on will appear here.",
  },
  favourites: {
    title: "Favorites",
    description: "Quick access to the files you starred.",
    listTitle: "Starred Files",
    emptyTitle: "No favourites yet",
    emptyDescription: "Star a file to find it faster later.",
  },
  trash: {
    title: "Trash",
    description: "Items in trash are permanently deleted after 30 days.",
    listTitle: "Deleted Files",
    emptyTitle: "Trash is empty",
    emptyDescription: "Deleted files will be listed here.",
  },
};

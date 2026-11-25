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
    title: "My Drive",
    description: "All the files and folders you own.",
    listTitle: "All Files",
    emptyTitle: "No files found",
    emptyDescription: "Upload a file or create a folder to get started.",
  },
  shared: {
    title: "Shared with Me",
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
    title: "Favourite",
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

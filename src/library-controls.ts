export type LibrarySortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "largest" | "smallest";

interface SortableLibraryFile {
  name: string;
  sizeBytes: number;
  createdAt: string;
}

export function matchesImageFormat(extension: string, filter: string) {
  const normalizedExtension = extension.toLowerCase();
  switch (filter) {
    case "All Images":
      return true;
    case "JPG / JPEG":
      return normalizedExtension === "jpg" || normalizedExtension === "jpeg";
    case "PNG":
    case "WebP":
    case "GIF":
    case "AVIF":
      return normalizedExtension === filter.toLowerCase();
    case "Other supported formats":
      return ["bmp", "tif", "tiff"].includes(normalizedExtension);
    default:
      return false;
  }
}

export function sortLibraryFiles<T extends SortableLibraryFile>(files: T[], sort: LibrarySortOption) {
  return files
    .map((file, index) => ({ file, index }))
    .sort((left, right) => {
      let comparison = 0;
      switch (sort) {
        case "newest":
          comparison = Date.parse(right.file.createdAt) - Date.parse(left.file.createdAt);
          break;
        case "oldest":
          comparison = Date.parse(left.file.createdAt) - Date.parse(right.file.createdAt);
          break;
        case "name-asc":
          comparison = left.file.name.localeCompare(right.file.name, undefined, { sensitivity: "base" });
          break;
        case "name-desc":
          comparison = right.file.name.localeCompare(left.file.name, undefined, { sensitivity: "base" });
          break;
        case "largest":
          comparison = right.file.sizeBytes - left.file.sizeBytes;
          break;
        case "smallest":
          comparison = left.file.sizeBytes - right.file.sizeBytes;
          break;
      }
      return comparison || left.index - right.index;
    })
    .map(({ file }) => file);
}

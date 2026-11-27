import {
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  File as FileGeneric,
  Folder,
  type LucideIcon,
} from "lucide-react";
import type { FileKind } from "@/types/drive";

interface FileKindStyle {
  icon: LucideIcon;
  /** Background of the icon tile */
  tile: string;
  /** Colour of the glyph */
  glyph: string;
}

export const FILE_KIND_STYLES: Record<FileKind, FileKindStyle> = {
  folder: { icon: Folder, tile: "bg-brand-50", glyph: "text-brand-600 fill-brand-200" },
  document: { icon: FileText, tile: "bg-category-document-soft", glyph: "text-category-document" },
  spreadsheet: { icon: FileSpreadsheet, tile: "bg-category-document-soft", glyph: "text-category-document" },
  pdf: { icon: FileText, tile: "bg-category-document-soft", glyph: "text-category-document" },
  image: { icon: FileImage, tile: "bg-category-image-soft", glyph: "text-category-image" },
  video: { icon: FileVideo, tile: "bg-category-video-soft", glyph: "text-category-video" },
  audio: { icon: FileAudio, tile: "bg-category-audio-soft", glyph: "text-category-audio" },
  archive: { icon: FileArchive, tile: "bg-category-other-soft", glyph: "text-category-other" },
  other: { icon: FileGeneric, tile: "bg-category-other-soft", glyph: "text-category-other" },
};

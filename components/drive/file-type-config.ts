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
  folder: { icon: Folder, tile: "bg-amber-50", glyph: "text-amber-500 fill-amber-300" },
  document: { icon: FileText, tile: "bg-blue-50", glyph: "text-blue-500" },
  spreadsheet: { icon: FileSpreadsheet, tile: "bg-emerald-50", glyph: "text-emerald-500" },
  pdf: { icon: FileText, tile: "bg-red-50", glyph: "text-red-500" },
  image: { icon: FileImage, tile: "bg-rose-50", glyph: "text-rose-500" },
  video: { icon: FileVideo, tile: "bg-red-50", glyph: "text-red-500" },
  audio: { icon: FileAudio, tile: "bg-rose-50", glyph: "text-rose-500" },
  archive: { icon: FileArchive, tile: "bg-violet-50", glyph: "text-violet-500" },
  other: { icon: FileGeneric, tile: "bg-zinc-100", glyph: "text-zinc-500" },
};

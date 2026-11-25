import { cn } from "@/lib/cn";
import type { FileKind } from "@/types/drive";
import { FILE_KIND_STYLES } from "./file-type-config";

type FileTypeIconSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<FileTypeIconSize, { tile: string; glyph: string }> = {
  sm: { tile: "size-7 rounded-md", glyph: "size-4" },
  md: { tile: "size-10 rounded-lg", glyph: "size-5" },
  lg: { tile: "size-16 rounded-xl", glyph: "size-8" },
};

interface FileTypeIconProps {
  kind: FileKind;
  size?: FileTypeIconSize;
}

export function FileTypeIcon({ kind, size = "md" }: FileTypeIconProps) {
  const style = FILE_KIND_STYLES[kind];
  const sizing = SIZE_CLASSES[size];
  const Icon = style.icon;

  return (
    <span aria-hidden className={cn("inline-flex shrink-0 items-center justify-center", style.tile, sizing.tile)}>
      <Icon className={cn(style.glyph, sizing.glyph)} />
    </span>
  );
}

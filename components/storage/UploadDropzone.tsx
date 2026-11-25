"use client";

import { Download } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/cn";

interface UploadDropzoneProps {
  /** Called with the selected / dropped files. Implement your upload logic here. */
  onFilesSelected?: (files: File[]) => void;
}

export function UploadDropzone({ onFilesSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    setSelectedCount(files.length);
    onFilesSelected?.(files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        dragging ? "border-brand-500 bg-brand-50" : "border-zinc-200 bg-zinc-50/60 hover:border-brand-300 hover:bg-brand-50/40",
      )}
    >
      <input ref={inputRef} type="file" multiple hidden onChange={handleInputChange} />

      <Download className="size-8 text-brand-600" />
      <p className="mt-3 text-sm font-semibold text-brand-700">Upload Your Files</p>
      <p className="mt-1 text-xs text-zinc-400">Drag and drop your here</p>

      {selectedCount > 0 && (
        <p role="status" className="mt-3 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
          {selectedCount} {selectedCount === 1 ? "file" : "files"} selected
        </p>
      )}
    </div>
  );
}

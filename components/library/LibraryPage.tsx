"use client";

/* eslint-disable @next/next/no-img-element -- private signed URLs are fetched directly by the browser. */
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { ArrowDownWideNarrow, AudioLines, Check, Download, File, FileArchive, FileCode2, FileSpreadsheet, FileText, Filter, Grid2X2, Image as ImageIcon, List, MoreHorizontal, Play, Search, SlidersHorizontal, UploadCloud, X } from "lucide-react";
import type { LibraryFile, LibrarySection } from "@/data/library-files";
import { matchesImageFormat, sortLibraryFiles, type LibrarySortOption } from "@/src/library-controls";
import { filesUpdatedEvent, notifyFilesUpdated } from "@/src/files-updated";

type CloudLibraryFile = LibraryFile & {
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  previewUrl?: string;
  url?: string;
  previewError?: string;
};

type UploadItemStatus = "queued" | "uploading" | "success" | "error";

interface UploadProgressItem {
  name: string;
  progress: number;
  status: UploadItemStatus;
}

const API_CATEGORY: Record<LibrarySection, string> = {
  images: "images",
  video: "videos",
  audio: "audio",
  files: "documents",
  "other-files": "other-files",
};

interface ApiFile {
  id: string;
  name: string;
  contentType: string;
  category: string;
  size: number;
  createdAt: string;
  previewUrl?: string;
}

function formatStorage(bytes: number) {
  if (bytes >= 1000 ** 3) return `${(bytes / 1000 ** 3).toFixed(1)} GB`;
  if (bytes >= 1000 ** 2) return `${(bytes / 1000 ** 2).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function mapApiFile(file: ApiFile): CloudLibraryFile {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "";
  return {
    id: file.id,
    name: file.name,
    ext,
    size: formatStorage(file.size),
    sizeBytes: file.size,
    date: new Date(file.createdAt).toLocaleDateString(),
    createdAt: file.createdAt,
    kind: file.category,
    category: file.category,
    contentType: file.contentType,
    previewUrl: file.previewUrl,
  };
}

const PAGE: Record<LibrarySection, { title: string; description: string; upload: string; summary: string; filters: string[] }> = {
  images: { title: "Images", description: "A visual home for every image in your cloud.", upload: "Upload images", summary: "Visual library", filters: ["All Images", "JPG / JPEG", "PNG", "WebP", "GIF", "AVIF", "Other supported formats"] },
  video: { title: "Videos", description: "Keep your films, clips and recordings organized.", upload: "Upload video", summary: "Video library", filters: ["All videos", "MP4", "M4V", "MOV", "WEBM", "OGV", "AVI", "MKV"] },
  audio: { title: "Audio", description: "Music, voice notes and podcasts, all in one place.", upload: "Upload audio", summary: "Audio library", filters: ["All audio", "MP3", "WAV", "AAC", "FLAC", "M4A", "OGG", "OGA", "OPUS"] },
  files: { title: "Files", description: "Your documents and everyday work files, ready when you need them.", upload: "Upload files", summary: "Documents", filters: ["All files", "PDF", "Word", "Excel", "PowerPoint", "Text documents"] },
  "other-files": { title: "Other Files", description: "Developer, data and archive files in one organized library.", upload: "Upload files", summary: "Other files", filters: ["All other files", "Data files", "Structured data", "Archives", "Code files", "Text & logs"] },
};

const FORMAT_COLORS: Record<string, string> = {
  JPG: "bg-category-image-soft text-category-image", PNG: "bg-category-image-soft text-category-image", JPEG: "bg-category-image-soft text-category-image", SVG: "bg-category-image-soft text-category-image", WEBP: "bg-category-image-soft text-category-image",
  MP4: "bg-category-video-soft text-category-video", MOV: "bg-category-video-soft text-category-video", WEBM: "bg-category-video-soft text-category-video", AVI: "bg-category-video-soft text-category-video",
  MP3: "bg-category-audio-soft text-category-audio", WAV: "bg-category-audio-soft text-category-audio", AAC: "bg-category-audio-soft text-category-audio", FLAC: "bg-category-audio-soft text-category-audio", M4A: "bg-category-audio-soft text-category-audio", OGG: "bg-category-audio-soft text-category-audio",
  PDF: "bg-category-document-soft text-category-document", DOCX: "bg-category-document-soft text-category-document", XLSX: "bg-category-document-soft text-category-document", PPTX: "bg-category-document-soft text-category-document", TXT: "bg-category-document-soft text-category-document", RTF: "bg-category-document-soft text-category-document",
  ZIP: "bg-category-other-soft text-category-other", RAR: "bg-category-other-soft text-category-other", "7Z": "bg-category-other-soft text-category-other", JSON: "bg-category-other-soft text-category-other", CSV: "bg-category-other-soft text-category-other", TS: "bg-category-other-soft text-category-other", SQL: "bg-category-other-soft text-category-other", YAML: "bg-category-other-soft text-category-other", LOG: "bg-category-other-soft text-category-other",
};

const STAT_CARD_TONES = ["blue", "violet", "green", "amber"] as const;

function formatIcon(ext: string) {
  if (["ZIP", "RAR", "7Z"].includes(ext)) return FileArchive;
  if (["CSV", "XLSX"].includes(ext)) return FileSpreadsheet;
  if (["JSON", "YAML", "TS", "SQL", "JS", "PY", "XML"].includes(ext)) return FileCode2;
  return FileText;
}

function matchesFilter(file: LibraryFile, filter: string) {
  if (file.category?.toLowerCase() === "images") return matchesImageFormat(file.ext, filter);
  if (filter.startsWith("All ")) return true;
  const key = filter.toLowerCase();
  const extension = file.ext.toLowerCase();
  const aliases: Record<string, string[]> = {
    word: ["word", "doc", "docx"], excel: ["excel", "xls", "xlsx"], powerpoint: ["slides", "ppt", "pptx"],
    "text documents": ["text", "txt", "rtf", "md"],
    "structured data": ["structured", "json", "xml", "yaml", "yml"], "data files": ["data", "csv", "json"],
    archives: ["archive", "zip", "rar", "7z"], "code files": ["code", "js", "ts", "html", "css", "py", "sql"],
    "text & logs": ["text", "log", "md"],
  };
  return extension === key || file.category?.toLowerCase() === key || aliases[key]?.some((value) => value === file.category?.toLowerCase() || value === extension) || false;
}

function uploadImageWithProgress(file: File, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "images");

    const request = new XMLHttpRequest();
    request.open("POST", "/api/files");
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    request.onload = () => {
      const result = request.response as { error?: string } | null;
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(result?.error || "Upload failed."));
      }
    };
    request.onerror = () => reject(new Error("A network error interrupted the upload."));
    request.onabort = () => reject(new Error("The upload was interrupted."));
    request.send(formData);
  });
}

async function requestPreviewUrl(fileId: string) {
  const response = await fetch(`/api/files/${fileId}?mode=preview`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || typeof result.url !== "string") {
    throw new Error(result.error || "Unable to load the file preview.");
  }
  return result.url;
}

function ImagePreview({ item }: { item: CloudLibraryFile }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <p role="alert" className="text-sm text-zinc-600">This image could not be displayed. You can still download it.</p>;
  }

  return (
    <img
      src={item.url}
      alt={item.name}
      onError={() => setFailed(true)}
      className="max-h-[70vh] max-w-full object-contain"
    />
  );
}

function PreviewDialog({ item, onClose, onDownload, onDelete }: {
  item: CloudLibraryFile;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const isImage = item.contentType.startsWith("image/");
  const isVideo = item.contentType.startsWith("video/");
  const isAudio = item.contentType.startsWith("audio/");
  const isPdf = item.contentType === "application/pdf";

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={`Preview ${item.name}`} className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p><p className="mt-0.5 text-xs text-zinc-500">{item.ext} · {item.size} · {item.date}</p></div><button onClick={onClose} aria-label="Close preview" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><X className="size-5" /></button></header>
      <div className="grid min-h-[300px] flex-1 place-items-center overflow-auto bg-zinc-100 p-5">
        {item.url && isImage && <ImagePreview item={item} />}
        {item.url && isVideo && <video src={item.url} controls className="max-h-[70vh] max-w-full rounded-xl bg-black" />}
        {item.url && isAudio && <audio src={item.url} controls className="w-full max-w-2xl" />}
        {item.url && isPdf && <iframe src={item.url} title={`Preview ${item.name}`} className="h-[70vh] w-full rounded-xl bg-white" />}
        {item.previewError && <p role="alert" className="max-w-md text-center text-sm text-zinc-600">{item.previewError}</p>}
        {!item.url && !item.previewError && <p className="text-sm text-zinc-500">Loading secure preview…</p>}
      </div>
      <footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
        <button type="button" onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-800">Delete file</button>
        <button type="button" onClick={onDownload} className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white"><Download className="size-4" /> Download</button>
      </footer>
    </section>
  </div>;
}

export function LibraryPage({ section }: { section: LibrarySection }) {
  const config = PAGE[section];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(config.filters[0]);
  const [sortOption, setSortOption] = useState<LibrarySortOption>("newest");
  const [view, setView] = useState<"grid" | "list">(section === "images" || section === "video" ? "grid" : "list");
  const [preview, setPreview] = useState<CloudLibraryFile | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [allFiles, setAllFiles] = useState<CloudLibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files?category=${API_CATEGORY[section]}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load files.");
      setAllFiles((result.files as ApiFile[]).map(mapApiFile));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load files.");
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    void loadFiles();
    window.addEventListener(filesUpdatedEvent, loadFiles);
    return () => window.removeEventListener(filesUpdatedEvent, loadFiles);
  }, [loadFiles]);

  const files = useMemo(
    () => {
      const filtered = allFiles.filter((file) =>
      file.name.toLowerCase().includes(query.toLowerCase())
      && matchesFilter(file, filter),
      );

      return sortLibraryFiles(filtered, sortOption);
    },
    [allFiles, query, filter, sortOption],
  );
  const sizeTotal = allFiles.reduce((total, file) => total + file.sizeBytes, 0);
  const fileFormats = new Set(allFiles.map((file) => section === "images" ? file.contentType : file.ext)).size;
  const lastAdded = allFiles[0]?.date ?? (section === "images" ? "No uploads yet" : "—");
  const imageStatsUnavailable = section === "images" && (loading || Boolean(loadError));
  const imageStatsPlaceholder = loadError ? "—" : "…";

  async function openPreview(file: CloudLibraryFile) {
    setPreview({ ...file, url: undefined, previewError: undefined });
    try {
      const url = await requestPreviewUrl(file.id);
      setPreview((current) => current?.id === file.id ? { ...current, url } : current);
    } catch (error) {
      setPreview((current) => current?.id === file.id
        ? { ...current, previewError: error instanceof Error ? error.message : "Unable to load the file preview." }
        : current);
    }
  }

  async function downloadFile(file: CloudLibraryFile) {
    try {
      const response = await fetch(`/api/files/${file.id}?mode=download`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to download this file.");
      window.location.assign(result.url);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to download this file.");
    }
  }

  async function deleteFile(file: CloudLibraryFile) {
    if (!window.confirm(`Permanently delete "${file.name}"?`)) return;
    try {
      const response = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
      const result = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to delete this file.");
      setAllFiles((current) => current.filter((entry) => entry.id !== file.id));
      setPreview(null);
      notifyFilesUpdated();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to delete this file.");
    }
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const uploads = Array.from(fileList);
    if (uploads.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccessCount(0);

    if (section === "images") {
      setUploadProgress(uploads.map((file) => ({ name: file.name, progress: 0, status: "queued" })));
      const failures: string[] = [];
      let successCount = 0;

      for (const [index, file] of uploads.entries()) {
        setUploadProgress((current) =>
          current.map((item, itemIndex) => itemIndex === index
            ? { ...item, status: "uploading" }
            : item),
        );

        try {
          await uploadImageWithProgress(file, (progress) => {
            setUploadProgress((current) =>
              current.map((item, itemIndex) => itemIndex === index ? { ...item, progress } : item),
            );
          });
          successCount += 1;
          setUploadProgress((current) =>
            current.map((item, itemIndex) => itemIndex === index
              ? { ...item, progress: 100, status: "success" }
              : item),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed.";
          failures.push(`${file.name}: ${message}`);
          setUploadProgress((current) =>
            current.map((item, itemIndex) => itemIndex === index
              ? { ...item, status: "error" }
              : item),
          );
        }
      }

      setUploading(false);
      setUploadSuccessCount(successCount);
      if (failures.length > 0) {
        setUploadError(failures.join(" "));
      } else if (successCount > 0) {
        setUploadOpen(false);
      }
      if (successCount > 0) {
        await loadFiles();
        notifyFilesUpdated();
      }
      return;
    }

    let uploadedAny = false;
    try {
      for (const file of uploads) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/files", { method: "POST", body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(`${file.name}: ${result.error || "Upload failed."}`);
        uploadedAny = true;
      }
      setUploadOpen(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload the selected files.");
    } finally {
      setUploading(false);
      if (uploadedAny) {
        await loadFiles();
        notifyFilesUpdated();
      }
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void uploadFiles(event.dataTransfer.files);
  }

  return <div className="page-enter library-page mx-auto w-full max-w-[1600px] pb-28">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><span className="size-1.5 rounded-full bg-brand-500" />{config.summary}</div><h1 className="text-3xl font-bold tracking-tight text-zinc-900">{config.title}</h1><p className="mt-1.5 max-w-2xl text-sm text-zinc-500">{config.description}</p></div>
      <button onClick={() => { setUploadOpen(true); setUploadError(null); setUploadProgress([]); setUploadSuccessCount(0); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700 transition hover:-translate-y-0.5 hover:shadow-lg"><UploadCloud className="size-[18px]" />{config.upload}</button>
    </header>

    <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        ["Files", imageStatsUnavailable ? imageStatsPlaceholder : loading ? "…" : section === "images" ? String(allFiles.length) : String(allFiles.length).padStart(2, "0"), "active files in this category"],
        ["Storage used", imageStatsUnavailable ? imageStatsPlaceholder : formatStorage(sizeTotal), "from stored file metadata"],
        ["File formats", imageStatsUnavailable ? imageStatsPlaceholder : String(fileFormats), "formats represented"],
        ["Last added", imageStatsUnavailable ? imageStatsPlaceholder : lastAdded, "most recent upload"],
      ].map(([label, value, note], index) => (
        <article key={label} className={`premium-stat-card premium-stat-card--${STAT_CARD_TONES[index]} rounded-xl border p-4`}>
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600">{label}</span>
            <span className="premium-stat-card-icon grid size-8 place-items-center rounded-lg">
              {index === 0 ? <File className="size-4" /> : index === 1 ? <SlidersHorizontal className="size-4" /> : index === 2 ? <Check className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
            </span>
          </div>
          <p className="relative mt-3 text-xl font-bold tracking-tight text-zinc-900">{value}</p>
          <p className="relative mt-0.5 text-[11px] text-zinc-500">{note}</p>
        </article>
      ))}
    </section>

    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100" /></div>
        <div className="flex items-center gap-2">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
            <Filter className="size-4 text-zinc-400" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className={`${section === "images" ? "max-w-[180px]" : "max-w-[160px]"} bg-transparent text-sm outline-none`}>
              {config.filters.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-600">
            <ArrowDownWideNarrow className="size-4 text-zinc-400" />
            <select value={sortOption} onChange={(event) => setSortOption(event.target.value as LibrarySortOption)} className="bg-transparent outline-none">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="largest">Largest First</option>
              <option value="smallest">Smallest First</option>
            </select>
          </label>
          <div className="flex rounded-xl border border-zinc-200 p-1">
            <button aria-label="Grid view" onClick={() => setView("grid")} className={`rounded-lg p-1.5 ${view === "grid" ? "bg-brand-50 text-brand-700" : "text-zinc-400"}`}><Grid2X2 className="size-4" /></button>
            <button aria-label="List view" onClick={() => setView("list")} className={`rounded-lg p-1.5 ${view === "list" ? "bg-brand-50 text-brand-700" : "text-zinc-400"}`}><List className="size-4" /></button>
          </div>
        </div>
      </div>
      {loadError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}
      {files.length === 0 ? (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{section === "audio" ? <AudioLines /> : section === "images" ? <ImageIcon /> : <FileText />}</span>
            <h2 className="mt-3 text-base font-semibold text-zinc-900">
              {loading ? "Loading files…" : loadError ? `Unable to load ${section === "images" ? "images" : "files"}` : query || filter !== config.filters[0] ? "Nothing found" : section === "images" ? "No images yet" : "No files yet"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {loading ? "Loading files from your private storage." : loadError ? "Please try again in a moment." : query || filter !== config.filters[0] ? "Try changing your search or format filter." : "Upload a file to see it here."}
            </p>
          </div>
        </div>
      ) : section === "images" ? (
        view === "grid"
          ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{files.map((file) => <ImageCard key={file.id} file={file} onPreview={() => void openPreview(file)} onDownload={() => void downloadFile(file)} />)}</div>
          : <ImageList files={files} onPreview={openPreview} onDownload={downloadFile} />
      ) : section === "video" ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{files.map((file) => <VideoCard key={file.id} file={file} onPreview={() => void openPreview(file)} />)}</div> : section === "audio" ? <div className="divide-y divide-zinc-100">{files.map((file) => <AudioRow key={file.id} file={file} onPlay={() => void openPreview(file)} onPreview={() => void openPreview(file)} />)}</div> : <FileTable files={files} onPreview={(file) => void openPreview(file)} other={section === "other-files"} />}
    </section>

    {preview && <PreviewDialog item={preview} onClose={() => setPreview(null)} onDownload={() => void downloadFile(preview)} onDelete={() => void deleteFile(preview)} />}
    {uploadOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-transparent p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) setUploadOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="upload-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="upload-dialog-title" className="text-lg font-bold">Add to {config.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">Files are validated and stored privately in Neon Object Storage.</p>
          </div>
          <button onClick={() => setUploadOpen(false)} disabled={uploading} aria-label="Close upload dialog" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"><X className="size-5" /></button>
        </div>
        <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`mt-5 grid min-h-52 place-items-center rounded-xl border-2 border-dashed p-6 text-center ${dragging ? "border-brand-500 bg-brand-50" : "border-brand-200 bg-brand-50/40"}`}>
          <div>
            <UploadCloud className="mx-auto size-9 text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-zinc-800">Drag and drop {section === "images" ? "images" : "files"} here</p>
            <p className="mt-1 text-xs text-zinc-500">{section === "images" ? "JPG, PNG, WebP, GIF, AVIF, BMP, and TIFF · up to 10 MB each" : "Images, videos, audio, documents, and other supported files · up to 10 MB each"}</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={section === "images" ? "image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/tiff,.jpg,.jpeg,.png,.webp,.gif,.avif,.bmp,.tif,.tiff" : undefined}
              hidden
              onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files); event.target.value = ""; }}
            />
            <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{uploading ? "Uploading…" : section === "images" ? "Choose images" : "Browse files"}</button>
          </div>
        </div>
        {section === "images" && uploadProgress.length > 0 && <ul aria-label="Image upload progress" className="mt-4 max-h-48 space-y-3 overflow-y-auto">
          {uploadProgress.map((item, index) => <li key={`${item.name}-${index}`} className="rounded-lg border border-zinc-100 p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-medium text-zinc-700">{item.name}</span>
              <span className={item.status === "error" ? "shrink-0 text-red-600" : item.status === "success" ? "shrink-0 text-emerald-600" : "shrink-0 text-zinc-500"}>
                {item.status === "queued" ? "Queued" : item.status === "uploading" ? `${item.progress}%` : item.status === "success" ? "Uploaded" : "Failed"}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div className={`h-full rounded-full transition-all ${item.status === "error" ? "bg-red-500" : "bg-brand-500"}`} style={{ width: `${item.progress}%` }} />
            </div>
          </li>)}
        </ul>}
        {section === "images" && uploadSuccessCount > 0 && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{uploadSuccessCount} {uploadSuccessCount === 1 ? "image" : "images"} uploaded successfully to your account.</p>}
        {uploadError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</p>}
      </section>
    </div>}
  </div>;
}

function ImageThumbnail({ file, className }: { file: CloudLibraryFile; className: string }) {
  const [source, setSource] = useState(file.previewUrl);
  const [failed, setFailed] = useState(false);
  const refreshed = useRef(false);

  if (!source || failed) return <ImageIcon className="size-10 text-blue-400" />;
  return <img
    src={source}
    alt={file.name}
    loading="lazy"
    onError={() => {
      if (refreshed.current) {
        setFailed(true);
        return;
      }
      refreshed.current = true;
      void requestPreviewUrl(file.id).then(setSource).catch(() => setFailed(true));
    }}
    className={className}
  />;
}

function ImageCard({ file, onPreview, onDownload }: { file: CloudLibraryFile; onPreview: () => void; onDownload: () => void }) {
  return <article className="library-file-card library-file-card--image group overflow-hidden rounded-xl border border-zinc-200 bg-white"><div className="relative"><button onClick={onPreview} aria-label={`Preview ${file.name}`} className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100"><ImageThumbnail key={file.previewUrl} file={file} className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.035] motion-reduce:transform-none" /><span className="absolute bottom-3 left-3 rounded-md bg-black/35 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">{file.ext}</span></button><button type="button" onClick={onDownload} aria-label={`Download ${file.name}`} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-white/90 text-zinc-700 opacity-0 shadow transition group-hover:opacity-100"><Download className="size-4" /></button></div><div className="flex items-center gap-3 p-3"><button onClick={onPreview} className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-semibold text-zinc-800">{file.name}</span><span className="mt-0.5 block text-xs text-zinc-400">{file.size} · {file.date}</span></button><button onClick={onDownload} aria-label={`Download ${file.name}`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100"><Download className="size-4" /></button></div></article>;
}

function ImageList({ files, onPreview, onDownload }: {
  files: CloudLibraryFile[];
  onPreview: (file: CloudLibraryFile) => void;
  onDownload: (file: CloudLibraryFile) => void;
}) {
  return <div className="divide-y divide-zinc-100">
    {files.map((file) => <article key={file.id} className="flex items-center gap-3 py-3">
      <button onClick={() => onPreview(file)} aria-label={`Preview ${file.name}`} className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100">
        <ImageThumbnail key={file.previewUrl} file={file} className="size-full object-contain p-1" />
      </button>
      <button onClick={() => onPreview(file)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-zinc-800">{file.name}</span>
        <span className="mt-0.5 block text-xs text-zinc-400">{file.ext} · {file.size} · {file.date}</span>
      </button>
      <button onClick={() => onDownload(file)} aria-label={`Download ${file.name}`} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100"><Download className="size-4" /></button>
    </article>)}
  </div>;
}

function VideoCard({ file, onPreview }: { file: CloudLibraryFile; onPreview: () => void }) {
  return <article className="library-file-card library-file-card--video group overflow-hidden rounded-xl border border-zinc-200 bg-white"><button onClick={onPreview} className="relative grid aspect-video w-full place-items-center overflow-hidden bg-gradient-to-br from-violet-950 to-slate-800" aria-label={`Preview ${file.name}`}><span className="grid size-12 place-items-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"><Play className="ml-0.5 size-5 fill-current" /></span><span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">{file.ext}</span></button><div className="flex items-center justify-between gap-3 p-4"><button onClick={onPreview} className="min-w-0 text-left"><span className="block truncate text-sm font-semibold text-zinc-900">{file.name}</span><span className="mt-1 block text-xs text-zinc-400">{file.size} · {file.date}</span></button><span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">{file.ext}</span></div></article>;
}

function AudioRow({ file, onPlay, onPreview }: { file: CloudLibraryFile; onPlay: () => void; onPreview: () => void }) {
  return <div className="premium-audio-row group flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap"><button onClick={onPlay} aria-label="Play audio" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100 group-hover:scale-105 motion-reduce:transform-none"><Play className="ml-0.5 size-4 fill-current" /></button><span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-lg bg-category-audio-soft text-category-audio"><AudioLines className="size-5" /></span><button onClick={onPreview} className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-semibold text-zinc-900">{file.name}</span><span className="mt-1 block truncate text-xs text-zinc-400">{file.contentType}</span></button><span className="hidden w-24 text-xs text-zinc-500 sm:block">{file.size}</span><span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">{file.ext}</span><button onClick={onPreview} aria-label="Audio details" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><MoreHorizontal className="size-4" /></button></div>;
}

function FileTable({ files, onPreview, other }: { files: CloudLibraryFile[]; onPreview: (file: CloudLibraryFile) => void; other: boolean }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-left"><thead><tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-400"><th className="pb-3">Name</th><th className="pb-3">Type</th><th className="pb-3">Size</th><th className="pb-3">Modified</th><th className="pb-3 text-right">Actions</th></tr></thead><tbody>{files.map((file) => { const Icon = formatIcon(file.ext); return <tr key={file.id} className="group border-b border-zinc-50 transition hover:bg-brand-50/40"><td className="py-3"><button onClick={() => onPreview(file)} className="flex min-w-0 items-center gap-3 text-left"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${FORMAT_COLORS[file.ext] || "bg-zinc-100 text-zinc-600"}`}><Icon className="size-5" /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-zinc-800">{file.name}</span>{other && <span className="mt-0.5 block text-[11px] text-zinc-400">{file.category}</span>}</span></button></td><td className="py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${FORMAT_COLORS[file.ext] || "bg-zinc-100 text-zinc-600"}`}>{file.ext}</span></td><td className="py-3 text-xs text-zinc-500">{file.size}</td><td className="py-3 text-xs text-zinc-500">{file.date}</td><td className="py-3 text-right"><button onClick={() => onPreview(file)} aria-label={`More actions for ${file.name}`} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><MoreHorizontal className="size-4" /></button></td></tr>; })}</tbody></table></div>;
}

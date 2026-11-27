export type FileCategory = "images" | "videos" | "audio" | "documents" | "other-files";

const FILE_TYPES: Record<string, { category: FileCategory; contentType: string }> = {
  jpg: { category: "images", contentType: "image/jpeg" },
  jpeg: { category: "images", contentType: "image/jpeg" },
  png: { category: "images", contentType: "image/png" },
  gif: { category: "images", contentType: "image/gif" },
  webp: { category: "images", contentType: "image/webp" },
  avif: { category: "images", contentType: "image/avif" },
  bmp: { category: "images", contentType: "image/bmp" },
  tif: { category: "images", contentType: "image/tiff" },
  tiff: { category: "images", contentType: "image/tiff" },
  mp4: { category: "videos", contentType: "video/mp4" },
  m4v: { category: "videos", contentType: "video/mp4" },
  mov: { category: "videos", contentType: "video/quicktime" },
  webm: { category: "videos", contentType: "video/webm" },
  ogv: { category: "videos", contentType: "video/ogg" },
  avi: { category: "videos", contentType: "video/x-msvideo" },
  mkv: { category: "videos", contentType: "video/x-matroska" },
  mp3: { category: "audio", contentType: "audio/mpeg" },
  m4a: { category: "audio", contentType: "audio/mp4" },
  aac: { category: "audio", contentType: "audio/aac" },
  flac: { category: "audio", contentType: "audio/flac" },
  wav: { category: "audio", contentType: "audio/wav" },
  ogg: { category: "audio", contentType: "audio/ogg" },
  oga: { category: "audio", contentType: "audio/ogg" },
  opus: { category: "audio", contentType: "audio/ogg" },
  pdf: { category: "documents", contentType: "application/pdf" },
  xml: { category: "documents", contentType: "application/xml" },
  doc: { category: "documents", contentType: "application/msword" },
  docx: { category: "documents", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  odt: { category: "documents", contentType: "application/vnd.oasis.opendocument.text" },
  rtf: { category: "documents", contentType: "application/rtf" },
  txt: { category: "documents", contentType: "text/plain" },
  md: { category: "documents", contentType: "text/markdown" },
  csv: { category: "documents", contentType: "text/csv" },
  xls: { category: "documents", contentType: "application/vnd.ms-excel" },
  xlsx: { category: "documents", contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  ppt: { category: "documents", contentType: "application/vnd.ms-powerpoint" },
  pptx: { category: "documents", contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  zip: { category: "other-files", contentType: "application/zip" },
  rar: { category: "other-files", contentType: "application/vnd.rar" },
  "7z": { category: "other-files", contentType: "application/x-7z-compressed" },
  json: { category: "other-files", contentType: "application/json" },
  yaml: { category: "other-files", contentType: "application/yaml" },
  yml: { category: "other-files", contentType: "application/yaml" },
  sql: { category: "other-files", contentType: "text/plain" },
  ts: { category: "other-files", contentType: "text/plain" },
  js: { category: "other-files", contentType: "text/plain" },
  log: { category: "other-files", contentType: "text/plain" },
};

export function inspectUploadedFile(name: string, reportedContentType: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const fileType = FILE_TYPES[extension];
  if (!fileType) return { error: "This file type is not allowed." } as const;

  const contentType = (reportedContentType || fileType.contentType).split(";")[0].trim().toLowerCase();
  const compatibleContentTypes = new Set([fileType.contentType, "application/octet-stream"]);
  if (extension === "wav") compatibleContentTypes.add("audio/x-wav");
  if (extension === "xml") compatibleContentTypes.add("text/xml");
  if (!compatibleContentTypes.has(contentType)) {
    return { error: "The file extension does not match its content type." } as const;
  }

  return {
    category: fileType.category,
    contentType: contentType === "application/octet-stream" ? fileType.contentType : contentType,
    extension,
  } as const;
}

export function hasValidImageSignature(contentType: string, bytes: Uint8Array) {
  const startsWith = (...signature: number[]) =>
    signature.every((value, index) => bytes[index] === value);
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));

  switch (contentType.toLowerCase()) {
    case "image/jpeg":
      return startsWith(0xff, 0xd8, 0xff);
    case "image/png":
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/gif":
      return ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "image/avif": {
      if (ascii(4, 8) !== "ftyp") return false;
      return /avif|avis/.test(ascii(8, Math.min(bytes.length, 32)));
    }
    case "image/bmp":
      return ascii(0, 2) === "BM";
    case "image/tiff":
      return (
        startsWith(0x49, 0x49, 0x2a, 0x00) ||
        startsWith(0x4d, 0x4d, 0x00, 0x2a) ||
        startsWith(0x49, 0x49, 0x2b, 0x00) ||
        startsWith(0x4d, 0x4d, 0x00, 0x2b)
      );
    default:
      return false;
  }
}

export function canPreviewContentType(contentType: string) {
  return /^(image\/(bmp|jpeg|png|gif|webp|avif)|video\/(mp4|webm|quicktime)|audio\/(mpeg|mp4|aac|wav|x-wav|ogg|flac)|application\/pdf)$/.test(contentType.toLowerCase());
}

export function safeFileName(name: string) {
  const baseName = name.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f\u007f]/g, "").trim() ?? "";
  return baseName.slice(0, 255);
}

export type LibrarySection = "images" | "video" | "audio" | "files" | "other-files";

export interface LibraryFile {
  id: string;
  name: string;
  ext: string;
  size: string;
  date: string;
  kind: string;
  artwork?: string;
  description?: string;
  creator?: string;
  duration?: string;
  category?: string;
}

const images = [
  ["coastline-at-dawn.jpg", "JPG", "4.8 MB", "Today", "Coastal cliffs and calm sea at sunrise", "nature"],
  ["city-after-rain.png", "PNG", "8.2 MB", "Yesterday", "City street reflecting neon lights after rain", "city"],
  ["alpine-lake.webp", "WEBP", "2.6 MB", "May 18, 2025", "Turquoise alpine lake surrounded by mountains", "nature"],
  ["studio-notes.jpeg", "JPEG", "3.1 MB", "May 16, 2025", "Minimal creative studio with warm light", "work"],
  ["desert-road.jpg", "JPG", "5.4 MB", "May 12, 2025", "Road crossing a wide desert at golden hour", "travel"],
  ["architecture-study.svg", "SVG", "420 KB", "May 10, 2025", "Modern geometric architecture detail", "work"],
];

const videos = [
  ["coastline-film.mp4", "MP4", "248 MB", "Today", "00:48", "Coastal cliffs and calm sea at sunrise"],
  ["product-story.mov", "MOV", "1.2 GB", "Yesterday", "02:36", "Minimal creative studio with warm light"],
  ["city-timelapse.mp4", "MP4", "684 MB", "May 19, 2025", "01:12", "City street reflecting neon lights after rain"],
  ["field-notes.webm", "WEBM", "92 MB", "May 15, 2025", "00:34", "Turquoise alpine lake surrounded by mountains"],
];

const audio = [
  ["Morning light.mp3", "MP3", "8.4 MB", "Today", "03:42", "Mila Hart", "music"],
  ["Ideas for the launch.wav", "WAV", "24.8 MB", "Yesterday", "12:08", "You", "recording"],
  ["Field recording — rain.m4a", "M4A", "12.2 MB", "May 20, 2025", "05:16", "You", "recording"],
  ["The creative process.flac", "FLAC", "36.1 MB", "May 17, 2025", "28:54", "North Star Podcast", "podcast"],
  ["Soft focus.ogg", "OGG", "6.7 MB", "May 14, 2025", "04:06", "Mila Hart", "music"],
];

const documents = [
  ["Brand guidelines 2025.pdf", "PDF", "8.1 MB", "Today", "pdf"],
  ["Q2 product roadmap.docx", "DOCX", "2.4 MB", "Yesterday", "word"],
  ["Campaign budget.xlsx", "XLSX", "1.8 MB", "May 20, 2025", "excel"],
  ["Launch presentation.pptx", "PPTX", "18.6 MB", "May 18, 2025", "slides"],
  ["Meeting notes.txt", "TXT", "24 KB", "May 16, 2025", "text"],
  ["Creative brief.rtf", "RTF", "360 KB", "May 12, 2025", "text"],
];

const otherFiles = [
  ["project-settings.json", "JSON", "18 KB", "Today", "data"],
  ["customer-export.csv", "CSV", "4.2 MB", "Yesterday", "data"],
  ["design-assets.zip", "ZIP", "286 MB", "May 20, 2025", "archive"],
  ["app-config.yaml", "YAML", "6 KB", "May 18, 2025", "structured"],
  ["deployment.log", "LOG", "820 KB", "May 15, 2025", "text"],
  ["utils.ts", "TS", "12 KB", "May 12, 2025", "code"],
  ["schema.sql", "SQL", "32 KB", "May 10, 2025", "code"],
];

export const LIBRARY_FILES: Record<LibrarySection, LibraryFile[]> = {
  images: images.map(([name, ext, size, date, description, category], index) => ({ id: `img-${index}`, name, ext, size, date, description, kind: "image", artwork: `https://images.unsplash.com/photo-${["1500530855697-b586d89ba3ee", "1519608487953-e999c86e7455", "1501785888041-af3ef285b470", "1497366754035-f200968a6e72", "1509316785289-025f5b846b35", "1511818966892-d7d671e672a2"][index]}?auto=format&fit=crop&w=900&q=85`, category })),
  video: videos.map(([name, ext, size, date, duration, description], index) => ({ id: `vid-${index}`, name, ext, size, date, duration, description, kind: "video", artwork: `https://images.unsplash.com/photo-${["1500530855697-b586d89ba3ee", "1497366754035-f200968a6e72", "1519608487953-e999c86e7455", "1501785888041-af3ef285b470"][index]}?auto=format&fit=crop&w=900&q=85` })),
  audio: audio.map(([name, ext, size, date, duration, creator, category], index) => ({ id: `aud-${index}`, name, ext, size, date, duration, creator, category, kind: "audio", artwork: `https://images.unsplash.com/photo-${["1516280440614-37939bbacd81", "1470225620780-dba8ba36b745", "1500530855697-b586d89ba3ee", "1511379938547-c1f69419868d", "1516280440614-37939bbacd81"][index]}?auto=format&fit=crop&w=240&q=80` })),
  files: documents.map(([name, ext, size, date, category], index) => ({ id: `doc-${index}`, name, ext, size, date, category, kind: "document" })),
  "other-files": otherFiles.map(([name, ext, size, date, category], index) => ({ id: `other-${index}`, name, ext, size, date, category, kind: "other" })),
};

import { DriveViewPage } from "@/components/drive/DriveViewPage";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function RecentPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return <DriveViewPage view="recent" query={q} />;
}

import { DriveViewPage } from "@/components/drive/DriveViewPage";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SharedPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return <DriveViewPage view="shared" query={q} />;
}

import { DriveViewPage } from "@/components/drive/DriveViewPage";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function MyDrivePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return <DriveViewPage view="my-drive" query={q} />;
}

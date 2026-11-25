import { DriveViewPage } from "@/components/drive/DriveViewPage";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function FavouritesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return <DriveViewPage view="favourites" query={q} />;
}

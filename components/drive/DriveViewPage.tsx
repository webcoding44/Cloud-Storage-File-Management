import { Download, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DRIVE_VIEWS } from "@/constants/drive-views";
import { getCurrentUser, getFiles } from "@/services/drive.service";
import type { DriveView } from "@/types/drive";
import { FilesExplorer } from "./FilesExplorer";
import { ProvidersSection } from "./ProvidersSection";
import { RecentUploadsSection } from "./RecentUploadsSection";

interface DriveViewPageProps {
  view: DriveView;
  query?: string;
}

function ViewActions({ view }: { view: DriveView }): ReactNode {
  if (view === "my-drive") {
    return (
      <>
        <Button icon={<Plus className="size-4" />}>New</Button>
        <Button variant="primary" icon={<Download className="size-4" />}>
          Import
        </Button>
      </>
    );
  }

  if (view === "trash") {
    return (
      <Button icon={<Trash2 className="size-4" />} className="text-red-600">
        Empty Trash
      </Button>
    );
  }

  return null;
}

/** Shared server component powering every file-listing page. */
export async function DriveViewPage({ view, query }: DriveViewPageProps) {
  const config = DRIVE_VIEWS[view];
  const [items, currentUser] = await Promise.all([getFiles({ view, query }), getCurrentUser()]);
  const isHome = view === "my-drive";

  return (
    <div className="page-enter">
      <PageHeader title={config.title} description={isHome ? undefined : config.description} actions={<ViewActions view={view} />} />

      {isHome && (
        <>
          <ProvidersSection />
          <RecentUploadsSection />
        </>
      )}

      <FilesExplorer
        title={config.listTitle}
        items={items}
        currentUserId={currentUser.id}
        emptyTitle={query ? "No results found" : config.emptyTitle}
        emptyDescription={query ? `Nothing matches “${query}”.` : config.emptyDescription}
      />
    </div>
  );
}

import { getStorageOverview } from "@/services/drive.service";
import { StorageCategoryList } from "./StorageCategoryList";
import { StorageGauge } from "./StorageGauge";
import { UploadDropzone } from "./UploadDropzone";

export async function StoragePanel() {
  const overview = await getStorageOverview();

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 py-6">
      <h2 className="text-center text-base font-semibold text-zinc-900">Cloud Storage</h2>

      <StorageGauge usedBytes={overview.usedBytes} totalBytes={overview.totalBytes} />
      <StorageCategoryList categories={overview.categories} />

      <div className="mt-auto pt-2">
        <UploadDropzone />
      </div>
    </div>
  );
}

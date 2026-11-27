import { StoragePanel } from "@/components/storage/StoragePanel";
import { CategoryCards } from "@/components/dashboard/CategoryCards";

export default function DashboardPage() {
  return (
    <div className="mx-auto grid min-h-full w-full max-w-[1860px] grid-cols-1 items-start gap-5 pb-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <CategoryCards />
      <aside aria-label="Cloud storage status" className="h-fit w-full rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.02] xl:sticky xl:top-4">
        <StoragePanel />
      </aside>
    </div>
  );
}

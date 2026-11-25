import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatItemMeta } from "@/lib/format";
import { getRecentUploads } from "@/services/drive.service";
import { FileTypeIcon } from "./FileTypeIcon";

export async function RecentUploadsSection() {
  const items = await getRecentUploads(6);

  return (
    <section aria-label="Recent uploads" className="mt-8">
      <SectionHeader
        title="Recent Uploads"
        action={
          <Link href="/recent" className="text-xs font-medium text-brand-600 hover:text-brand-800">
            See All
          </Link>
        }
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/40"
            >
              <FileTypeIcon kind={item.kind} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-900">{item.name}</span>
                <span className="mt-0.5 block text-xs text-zinc-400">{formatItemMeta(item)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

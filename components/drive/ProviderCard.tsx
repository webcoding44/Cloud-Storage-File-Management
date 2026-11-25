import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatBytes, formatFileCount } from "@/lib/format";
import type { StorageProvider } from "@/types/drive";
import { ProviderLogo } from "./ProviderLogo";

export function ProviderCard({ provider }: { provider: StorageProvider }) {
  const percentage = (provider.usedBytes / provider.totalBytes) * 100;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md hover:shadow-zinc-200/70">
      <ProviderLogo provider={provider.id} />

      <h3 className="mt-4 text-sm font-semibold text-zinc-900">{provider.name}</h3>
      <p className="mt-0.5 text-xs text-zinc-400">{formatFileCount(provider.fileCount)}</p>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-zinc-700">
          {formatBytes(provider.usedBytes)} / {formatBytes(provider.totalBytes)}
        </p>
        <ProgressBar value={percentage} tone={provider.tone} label={`${provider.name} storage used`} />
      </div>
    </article>
  );
}

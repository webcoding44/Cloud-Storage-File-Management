import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-14 text-center">
      <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <FolderOpen className="size-6" />
      </span>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-zinc-500">{description}</p>}
    </div>
  );
}

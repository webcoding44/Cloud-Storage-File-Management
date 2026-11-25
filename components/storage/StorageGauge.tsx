import { formatBytes } from "@/lib/format";

interface StorageGaugeProps {
  usedBytes: number;
  totalBytes: number;
}

const ARC_PATH = "M 24 100 A 76 76 0 0 1 176 100";

/** Semi-circular usage gauge rendered as pure SVG (server-safe). */
export function StorageGauge({ usedBytes, totalBytes }: StorageGaugeProps) {
  const percentage = Math.min(100, (usedBytes / totalBytes) * 100);

  return (
    <div
      role="img"
      aria-label={`${formatBytes(usedBytes)} used of ${formatBytes(totalBytes)}`}
      className="relative mx-auto w-full max-w-[260px]"
    >
      <svg viewBox="0 0 200 108" className="w-full">
        <defs>
          <linearGradient id="storage-gauge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand-700)" />
            <stop offset="100%" stopColor="var(--color-brand-400)" />
          </linearGradient>
        </defs>
        <path d={ARC_PATH} pathLength={100} fill="none" stroke="#f0f0f5" strokeWidth={28} strokeLinecap="round" />
        <path
          d={ARC_PATH}
          pathLength={100}
          fill="none"
          stroke="url(#storage-gauge-gradient)"
          strokeWidth={28}
          strokeLinecap="round"
          strokeDasharray={`${percentage} 100`}
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="text-2xl font-bold text-zinc-900">{formatBytes(usedBytes)}</p>
        <p className="text-xs text-zinc-400">Used of {formatBytes(totalBytes).replace(".00", "")}</p>
      </div>
    </div>
  );
}

import { cn } from "@/lib/cn";
import type { ProgressTone } from "@/types/drive";

const TONE_CLASSES: Record<ProgressTone, { track: string; fill: string }> = {
  green: { track: "bg-emerald-100", fill: "bg-emerald-500" },
  blue: { track: "bg-blue-100", fill: "bg-blue-600" },
  sky: { track: "bg-sky-100", fill: "bg-sky-500" },
  red: { track: "bg-red-100", fill: "bg-red-500" },
};

interface ProgressBarProps {
  /** 0 – 100 */
  value: number;
  tone?: ProgressTone;
  label?: string;
}

export function ProgressBar({ value, tone = "blue", label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const classes = TONE_CLASSES[tone];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("h-1.5 w-full overflow-hidden rounded-full", classes.track)}
    >
      <div className={cn("h-full rounded-full", classes.fill)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import { MOTION } from "@/components/motion/tokens";
import { formatBytes } from "@/lib/format";

interface StorageGaugeProps {
  usedBytes: number;
  totalBytes: number;
  caption?: string;
}

const ARC_PATH = "M 24 100 A 76 76 0 0 1 176 100";

/** Animated, accessible semicircular storage usage gauge. */
export function StorageGauge({ usedBytes, totalBytes, caption = "used" }: StorageGaugeProps) {
  const reduceMotion = useReducedMotion();
  const percentage = totalBytes > 0 ? Math.min(100, (usedBytes / totalBytes) * 100) : 0;

  return (
    <div
      role="img"
      aria-label={`${formatBytes(usedBytes)} ${caption} of ${formatBytes(totalBytes)}`}
      className="relative mx-auto w-full max-w-[280px]"
    >
      <svg viewBox="0 0 200 116" className="w-full overflow-visible">
        <defs>
          <linearGradient id="storage-gauge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand-700)" />
            <stop offset="100%" stopColor="var(--color-brand-400)" />
          </linearGradient>
        </defs>
        <path d={ARC_PATH} fill="none" stroke="var(--border)" strokeWidth={28} strokeLinecap="round" />
        <motion.path
          d={ARC_PATH}
          fill="none"
          stroke="url(#storage-gauge-gradient)"
          strokeWidth={28}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: percentage / 100 }}
          transition={{ duration: reduceMotion ? 0 : MOTION.chart, ease: MOTION.easing }}
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="text-2xl font-bold text-zinc-900">{formatBytes(usedBytes)}</p>
        <p className="text-xs text-zinc-400">of {formatBytes(totalBytes)} {caption}</p>
        <p className="mt-1 text-[10px] font-semibold text-brand-600">{percentage.toFixed(1)}% used</p>
      </div>
    </div>
  );
}

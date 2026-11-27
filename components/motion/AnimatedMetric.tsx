"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";
import { MOTION } from "./tokens";

function formatAnimatedBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const digits = unit === 0 ? 0 : value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unit]}`;
}

interface AnimatedMetricProps {
  value: number;
  format?: "bytes" | "count";
  duration?: number;
  className?: string;
}

export function AnimatedMetric({ value, format = "count", duration = 0.85, className }: AnimatedMetricProps) {
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useMotionValue(prefersReducedMotion ? value : 0);
  const formatted = useTransform(motionValue, (current) =>
    format === "bytes" ? formatAnimatedBytes(current) : Math.round(current).toLocaleString("en-US"),
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: MOTION.easing });
    return controls.stop;
  }, [duration, motionValue, prefersReducedMotion, value]);

  return <motion.span aria-label={format === "bytes" ? formatAnimatedBytes(value) : value.toLocaleString("en-US")} className={className}>{formatted}</motion.span>;
}

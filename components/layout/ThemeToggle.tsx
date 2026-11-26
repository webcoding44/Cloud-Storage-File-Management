"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="group relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-100/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <span className="relative size-5 transition-transform duration-300 group-hover:rotate-12">
        <MoonStar aria-hidden="true" className="theme-toggle-moon size-5 text-brand-600" />
        <Sun aria-hidden="true" className="theme-toggle-sun absolute inset-0 size-5 text-amber-400" />
      </span>
    </button>
  );
}

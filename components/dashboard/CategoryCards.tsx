"use client";

import Link from "next/link";
import { AudioLines, ArrowUpRight, Cloud, FileStack, FolderArchive, Images, Play, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MOTION } from "@/components/motion/tokens";
import { formatBytes } from "@/lib/format";
import { AnimatedMetric } from "@/components/motion/AnimatedMetric";
import { useStorageStats } from "@/components/storage/useStorageStats";

const CATEGORIES: {
  name: string;
  href: string;
  updated: string;
  Icon: LucideIcon;
  tone: string;
  artwork?: string;
  preview: "photo" | "audio" | "documents" | "other";
}[] = [
  { name: "Images", href: "/images", updated: "Your images", Icon: Images, tone: "bg-blue-500", preview: "photo" },
  { name: "Videos", href: "/video", updated: "Your videos", Icon: Play, tone: "bg-violet-500", preview: "photo" },
  { name: "Audio", href: "/audio", updated: "Your audio", Icon: AudioLines, tone: "bg-teal-500", preview: "audio" },
  { name: "Documents", href: "/files", updated: "Your documents", Icon: FileStack, tone: "bg-amber-500", preview: "documents" },
  { name: "Other files", href: "/other-files", updated: "Your files", Icon: FolderArchive, tone: "bg-slate-500", preview: "other" },
];

function categoryUsageKey(name: string) {
  return name === "Other files" ? "other-files" : name.toLowerCase();
}

function CardPreview({ category }: { category: (typeof CATEGORIES)[number] }) {
  const Icon = category.Icon;
  if (category.preview === "photo" && category.artwork) {
    return (
      <div role="img" aria-label={`${category.name} preview`} className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none" style={{ backgroundImage: `url("${category.artwork}")` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          <Icon className="size-3.5" /> {category.name}
        </span>
        {category.preview === "photo" && category.name === "Videos" && <span className="absolute inset-0 m-auto grid size-10 place-items-center rounded-full bg-white/85 text-violet-700 shadow-lg"><Play className="ml-0.5 size-4 fill-current" /></span>}
      </div>
    );
  }

  if (category.preview === "audio") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500">
        <div className="absolute -right-8 -top-12 size-44 rounded-full border border-white/15" />
        <div className="absolute -right-1 -top-5 size-32 rounded-full border border-white/20" />
        <div className="absolute inset-x-5 bottom-0 flex h-20 items-center justify-center gap-1 opacity-90" aria-hidden="true">
          {Array.from({ length: 30 }, (_, index) => <span key={index} className="w-1 rounded-full bg-white/90" style={{ height: `${18 + ((index * 17 + 11) % 46)}%` }} />)}
        </div>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md"><Icon className="size-3.5" /> Audio library</span>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${category.preview === "documents" ? "bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100" : "bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100"}`}>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(100,116,139,.22) 1px, transparent 0)", backgroundSize: "18px 18px" }} />
      <div className="relative grid size-[68px] place-items-center rounded-2xl border border-white/80 bg-white/75 shadow-lg shadow-slate-900/10 backdrop-blur-sm">
        <Icon className={`size-8 ${category.preview === "documents" ? "text-amber-600" : "text-slate-600"}`} strokeWidth={1.7} />
      </div>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur-md"><Icon className="size-3.5" /> {category.name}</span>
    </div>
  );
}

export function CategoryCards() {
  const reduceMotion = useReducedMotion();
  const { stats, error, loading } = useStorageStats();
  const usage = Object.fromEntries((stats?.personal.categories ?? []).map((category) => [
    categoryUsageKey(category.category === "other-files" ? "Other files" : category.category),
    { fileCount: category.fileCount, totalBytes: category.totalBytes },
  ]));

  return (
    <section aria-labelledby="category-cards-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Your cloud library</p>
          <h1 id="category-cards-title" className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">Browse categories</h1>
          <p className="mt-1 text-sm text-zinc-500">Find your files, organized in one place.</p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500">5 categories</span>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Your storage used",
            value: stats?.personal.usedBytes,
            format: "bytes" as const,
            detail: "Across your files",
            Icon: Cloud,
            tone: "blue",
          },
          {
            label: "Your files",
            value: stats?.personal.fileCount,
            format: "count" as const,
            detail: "In your library",
            Icon: FileStack,
            tone: "violet",
          },
          {
            label: "Added this month",
            value: stats?.personal.uploadedThisMonth,
            format: "count" as const,
            detail: "New uploads",
            Icon: ArrowUpRight,
            tone: "green",
          },
          {
            label: "Project storage used",
            value: stats?.projectPool.usedBytes,
            format: "bytes" as const,
            detail: stats ? `of ${formatBytes(stats.projectPool.capacityBytes)} shared capacity` : "Shared Neon project pool",
            Icon: Cloud,
            tone: "amber",
          },
        ].map(({ label, value, format, detail, Icon, tone }, index) => (
          <motion.article
            key={label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : MOTION.entrance, delay: reduceMotion ? 0 : index * MOTION.stagger, ease: MOTION.easing }}
            whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02, transition: { duration: MOTION.fast, ease: MOTION.easing } }}
            className={`premium-stat-card premium-stat-card--${tone} group rounded-2xl border p-4`}
          >
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-zinc-500">{label}</span>
              <span className="premium-stat-card-icon grid size-9 place-items-center rounded-xl">
                <Icon className="size-4" />
              </span>
            </div>
            <p className="relative mt-3 text-xl font-bold tracking-tight text-zinc-900">
              {value === undefined ? (loading ? "…" : "—") : <AnimatedMetric value={value} format={format} />}
            </p>
            <p className="relative mt-1 text-[11px] text-zinc-500">{detail}</p>
          </motion.article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {CATEGORIES.map((category, index) => (
          <motion.article
            key={category.name}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: reduceMotion ? 0 : MOTION.entrance, delay: reduceMotion ? 0 : index * MOTION.stagger, ease: MOTION.easing }}
            whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: MOTION.fast } }}
            className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.03] transition-shadow hover:shadow-lg hover:shadow-zinc-900/[0.08]"
          >
            <Link href={category.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500">
              <div className="relative h-36 overflow-hidden sm:h-32 xl:h-36">
                <CardPreview category={category} />
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-zinc-700 shadow-sm backdrop-blur">{stats ? `${usage[categoryUsageKey(category.name)]?.fileCount ?? 0} files` : loading ? "Loading…" : "—"}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${category.tone} text-white`}><category.Icon className="size-4" /></span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-zinc-900">{category.name}</h2>
                      <p className="mt-0.5 text-[11px] text-zinc-400">{category.updated}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600 motion-reduce:transform-none" />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
                  <span className="text-zinc-500">Storage used</span>
                  <span className="font-semibold text-zinc-800">{stats ? formatBytes(usage[categoryUsageKey(category.name)]?.totalBytes ?? 0) : loading ? "Loading…" : "—"}</span>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

const PALETTES = [
  "from-violet-400 to-fuchsia-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
] as const;

type AvatarSize = "sm" | "md";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "size-6 text-[10px]",
  md: "size-9 text-xs",
};

function pickPalette(name: string): string {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        pickPalette(name),
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}

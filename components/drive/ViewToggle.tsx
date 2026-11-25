import { LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ViewMode } from "@/types/drive";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS = [
  { mode: "list", label: "List view", icon: Rows3 },
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
] as const;

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label="Change layout" className="flex items-center gap-1">
      {OPTIONS.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md transition-colors",
            value === mode ? "bg-brand-50 text-brand-600" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700",
          )}
        >
          <Icon className="size-[18px]" />
        </button>
      ))}
    </div>
  );
}

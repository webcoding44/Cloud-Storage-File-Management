import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  /** Shows a small notification dot in the corner */
  badge?: boolean;
}

export function IconButton({ label, children, badge = false, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-[color,background-color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:transform-none",
        "hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
      {badge && <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />}
    </button>
  );
}

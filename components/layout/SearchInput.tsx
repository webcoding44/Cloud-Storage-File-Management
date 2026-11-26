"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";

const DEBOUNCE_MS = 300;

/**
 * Debounced search box that stores its value in the `?q=` URL parameter,
 * so server pages can read it and filter data on the server.
 */
export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setValue(next);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) params.set("q", next);
      else params.delete("q");

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }, DEBOUNCE_MS);
  }

  return (
    <label className="relative block w-full max-w-md">
      <span className="sr-only">Search your files</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search your file"
        className="h-11 w-full rounded-xl bg-zinc-100 pl-11 pr-4 text-[15px] text-zinc-800 outline-none ring-brand-500/40 transition placeholder:text-zinc-400 focus:bg-white focus:ring-2"
      />
    </label>
  );
}

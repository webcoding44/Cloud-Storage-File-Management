import { ArrowDown, ArrowUp, MoreVertical, Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";
import { formatBytes, formatDate } from "@/lib/format";
import type { DriveItem, SortKey, SortState } from "@/types/drive";
import { FileTypeIcon } from "./FileTypeIcon";

interface Column {
  key: SortKey;
  label: string;
  className?: string;
}

const COLUMNS: Column[] = [
  { key: "name", label: "Name" },
  { key: "owner", label: "Owner", className: "hidden md:table-cell" },
  { key: "modifiedAt", label: "Last Modified", className: "hidden sm:table-cell" },
  { key: "sizeBytes", label: "Size" },
];

interface FilesTableProps {
  items: DriveItem[];
  currentUserId: string;
  sort: SortState;
  onSort: (key: SortKey) => void;
}

export function FilesTable({ items, currentUserId, sort, onSort }: FilesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500">
          <tr>
            {COLUMNS.map((column) => {
              const active = sort.key === column.key;
              const SortIcon = sort.direction === "asc" ? ArrowUp : ArrowDown;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                  className={cn("px-4 py-3 font-medium", column.className)}
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={cn("inline-flex items-center gap-1 hover:text-zinc-900", active && "text-zinc-900")}
                  >
                    {column.label}
                    <SortIcon className={cn("size-3", active ? "opacity-100" : "opacity-30")} />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="w-20 px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => (
            <tr key={item.id} className="group transition-colors hover:bg-brand-50/40">
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileTypeIcon kind={item.kind} size="sm" />
                  <span className="truncate font-medium text-zinc-800">{item.name}</span>
                </div>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Avatar name={item.owner.name} size="sm" />
                  {item.owner.id === currentUserId ? "Me" : item.owner.name}
                </div>
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-zinc-600 sm:table-cell">{formatDate(item.modifiedAt)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{formatBytes(item.sizeBytes)}</td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-end gap-0.5">
                  {item.starred && <Star aria-label="Starred" className="size-4 fill-amber-400 text-amber-400" />}
                  <IconButton label={`More actions for ${item.name}`} className="size-8 opacity-60 group-hover:opacity-100">
                    <MoreVertical className="size-4" />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

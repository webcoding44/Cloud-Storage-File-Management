import { Cloud } from "lucide-react";

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-600/30">
        <Cloud className="size-4 fill-white" />
      </span>
      <span className="text-lg font-bold tracking-tight text-white">Skycrate</span>
    </div>
  );
}

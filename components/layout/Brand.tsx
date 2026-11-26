import { Cloud } from "lucide-react";

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-600/30">
        <Cloud className="size-[18px] fill-white" />
      </span>
      <span className="flex flex-col text-white">
        <span className="text-[17px] font-bold leading-5 tracking-tight">CloudNest</span>
        <span className="mt-0.5 text-[8px] font-semibold tracking-[0.18em] text-zinc-400">CLOUD STORAGE</span>
      </span>
    </div>
  );
}

import { Cloud } from "lucide-react";
import type { ProviderId } from "@/types/drive";

function GoogleDriveLogo() {
  return (
    <svg viewBox="0 0 87.3 78" className="size-6" aria-hidden>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

function OneDriveLogo() {
  return <Cloud className="size-6 fill-blue-600 text-blue-600" aria-hidden />;
}

function MegaLogo() {
  return (
    <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-full bg-red-600 text-[13px] font-bold leading-none text-white">
      M
    </span>
  );
}

function DropboxLogo() {
  return (
    <svg viewBox="0 0 43 40" className="size-6" aria-hidden>
      <path
        fill="#0061ff"
        d="M12.6 0 0 8.1l8.7 7L21.3 7zM0 22.1l12.6 8.1 8.7-7-12.6-8.1zM21.3 23.2l8.7 7 12.6-8.1-8.7-7zM42.6 8.1 30 0l-8.7 7 12.6 8.1zM21.4 24.3l-8.8 7-3.8-2.5v2.8l12.6 7.6 12.6-7.6v-2.8l-3.8 2.5z"
      />
    </svg>
  );
}

const LOGOS: Record<ProviderId, () => React.JSX.Element> = {
  "google-drive": GoogleDriveLogo,
  "one-drive": OneDriveLogo,
  mega: MegaLogo,
  dropbox: DropboxLogo,
};

export function ProviderLogo({ provider }: { provider: ProviderId }) {
  const Logo = LOGOS[provider];
  return (
    <span className="inline-flex size-11 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-100">
      <Logo />
    </span>
  );
}

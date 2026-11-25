import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-semibold text-zinc-900">Page not found</h1>
      <p className="max-w-sm text-sm text-zinc-500">The page you are looking for doesn’t exist or has been moved.</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-lg bg-gradient-to-b from-brand-500 to-brand-700 px-5 text-sm font-semibold text-white"
      >
        Back to My Drive
      </Link>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-40 rounded-md bg-zinc-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-40 rounded-xl bg-zinc-100" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-zinc-100" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 animate-pulse">
      <div className="h-14 bg-white/80 dark:bg-stone-950/80 border-b border-stone-200/50 dark:border-stone-800/50" />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-64 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

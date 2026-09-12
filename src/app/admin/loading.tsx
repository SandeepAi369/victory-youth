export default function AdminLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="h-12 bg-muted/50 border-b" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b last:border-0">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="flex-1" />
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

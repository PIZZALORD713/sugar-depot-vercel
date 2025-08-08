export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-64 rounded-2xl animate-pulse bg-muted/30" />
      ))}
    </div>
  );
}

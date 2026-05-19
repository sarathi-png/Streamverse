export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px]">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-dark-700 shimmer-bg" />
      <div className="mt-3 px-1 space-y-2">
        <div className="h-4 bg-dark-700 rounded shimmer-bg w-3/4" />
        <div className="h-3 bg-dark-700 rounded shimmer-bg w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="py-4 sm:py-6">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="h-6 bg-dark-700 rounded shimmer-bg w-48" />
      </div>
      <div className="flex gap-4 sm:gap-5 overflow-hidden px-4 sm:px-6 lg:px-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] lg:h-screen bg-dark-700">
      <div className="absolute inset-0 shimmer-bg" />
      <div className="absolute bottom-24 left-8 max-w-xl space-y-4">
        <div className="h-4 bg-dark-600 rounded shimmer-bg w-32" />
        <div className="h-12 bg-dark-600 rounded shimmer-bg w-96" />
        <div className="h-3 bg-dark-600 rounded shimmer-bg w-64" />
        <div className="h-3 bg-dark-600 rounded shimmer-bg w-48" />
        <div className="flex gap-3 pt-2">
          <div className="h-12 bg-dark-600 rounded-2xl shimmer-bg w-36" />
          <div className="h-12 bg-dark-600 rounded-2xl shimmer-bg w-36" />
        </div>
      </div>
    </div>
  );
}

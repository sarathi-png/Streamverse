export default function SkeletonCardRow({ count = 8 }: { count?: number }) {
  return (
    <section className="relative py-4 sm:py-6">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="skeleton-text h-6 w-48" />
      </div>
      <div className="flex gap-4 sm:gap-5 overflow-hidden px-4 sm:px-6 lg:px-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px]">
            <div className="skeleton-card aspect-[2/3] w-full" />
            <div className="mt-3 space-y-2">
              <div className="skeleton-text h-3 w-3/4" />
              <div className="skeleton-text h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

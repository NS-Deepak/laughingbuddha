export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-binance-bg text-binance-text pb-20">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-binance-surface p-5 rounded-xl border border-binance-border animate-pulse">
            <div className="h-3 bg-binance-hover rounded w-24 mb-3"></div>
            <div className="h-8 bg-binance-hover rounded w-32 mb-2"></div>
            <div className="h-3 bg-binance-hover rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Search Skeleton */}
      <div className="w-full max-w-2xl">
        <div className="h-10 bg-binance-surface rounded-lg border border-binance-border animate-pulse"></div>
      </div>

      {/* Quick Add Skeleton */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 bg-binance-surface rounded-lg border border-binance-border animate-pulse"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-binance-surface rounded-xl border border-binance-border overflow-hidden">
        <div className="px-5 py-4 border-b border-binance-border">
          <div className="h-5 bg-binance-hover rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-binance-bg rounded-lg animate-pulse">
              <div className="h-8 w-8 bg-binance-hover rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-binance-hover rounded w-24 mb-2"></div>
                <div className="h-3 bg-binance-hover rounded w-16"></div>
              </div>
              <div className="h-4 bg-binance-hover rounded w-20"></div>
              <div className="h-4 bg-binance-hover rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
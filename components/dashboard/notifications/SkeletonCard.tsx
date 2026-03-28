export function SkeletonCard() {
  return (
    <div className="bg-binance-surface rounded-xl border border-binance-border p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-binance-bg rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-binance-bg rounded" />
          <div className="h-3 w-16 bg-binance-bg rounded" />
        </div>
      </div>
    </div>
  );
}

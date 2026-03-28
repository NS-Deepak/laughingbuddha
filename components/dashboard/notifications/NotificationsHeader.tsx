import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function NotificationsHeader() {
  return (
    <div className="flex justify-between items-end pb-2">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-binance-secondary hover:text-binance-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60 rounded-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl leading-9 font-semibold text-binance-brand">Notifications</h1>
          <p className="text-sm leading-5 text-binance-secondary mt-1">Price alerts & scheduled digests</p>
        </div>
      </div>
    </div>
  );
}

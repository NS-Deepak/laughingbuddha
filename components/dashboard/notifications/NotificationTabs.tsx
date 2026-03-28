import { Timer, TrendingUp } from "lucide-react";
import type { ActiveTab } from "./types";

interface NotificationTabsProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  activeAlertCount: number;
  activeDigestCount: number;
}

export function NotificationTabs({
  activeTab,
  onChange,
  activeAlertCount,
  activeDigestCount,
}: NotificationTabsProps) {
  return (
    <div className="border-b border-binance-border pb-4">
      <div className="inline-flex max-w-full items-center gap-1 rounded-xl p-1 bg-binance-surface border border-binance-border overflow-x-auto">
        <button
          onClick={() => onChange("alerts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60 ${
            activeTab === "alerts"
              ? "bg-binance-brand text-black"
              : "text-binance-secondary hover:text-binance-text hover:bg-binance-bg/60"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Price Alerts
          <span
            className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
              activeTab === "alerts" ? "bg-black/15" : "bg-binance-bg/70"
            }`}
          >
            {activeAlertCount}
          </span>
        </button>
        <button
          onClick={() => onChange("digests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60 ${
            activeTab === "digests"
              ? "bg-binance-brand text-black"
              : "text-binance-secondary hover:text-binance-text hover:bg-binance-bg/60"
          }`}
        >
          <Timer className="w-4 h-4" />
          Scheduled Digests
          <span
            className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
              activeTab === "digests" ? "bg-black/15" : "bg-binance-bg/70"
            }`}
          >
            {activeDigestCount}
          </span>
        </button>
      </div>
    </div>
  );
}

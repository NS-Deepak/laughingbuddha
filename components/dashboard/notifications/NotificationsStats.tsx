import { Bell, Settings, Timer } from "lucide-react";

interface NotificationsStatsProps {
  activeAlertCount: number;
  activeDigestCount: number;
}

export function NotificationsStats({ activeAlertCount, activeDigestCount }: NotificationsStatsProps) {
  return (
    <div className="rounded-2xl border border-binance-border bg-binance-surface/70 px-5 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2 text-binance-secondary text-sm leading-5">
          <Bell className="w-3 h-3" />
          Active Alerts
          </div>
          <span className="text-xl leading-7 font-semibold text-binance-text">{activeAlertCount}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2 text-binance-secondary text-sm leading-5">
          <Timer className="w-3 h-3" />
          Active Digests
          </div>
          <span className="text-xl leading-7 font-semibold text-binance-text">{activeDigestCount}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2 text-binance-secondary text-sm leading-5">
          <Settings className="w-3 h-3" />
          Telegram
          </div>
          <span className="text-sm leading-5 font-medium text-binance-up">Connected</span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Bell, Info, Loader2, Search, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlertFormState, Asset, PriceAlert } from "./types";

interface AlertsPanelProps {
  alerts: PriceAlert[];
  assets: Asset[];
  filteredAssets: Asset[];
  showAlertForm: boolean;
  saving: boolean;
  assetSearch: string;
  alertForm: AlertFormState;
  onAssetSearchChange: (value: string) => void;
  onAlertFormChange: (next: AlertFormState) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onDelete: (id: string) => void;
}

export function AlertsPanel({
  alerts,
  assets,
  filteredAssets,
  showAlertForm,
  saving,
  assetSearch,
  alertForm,
  onAssetSearchChange,
  onAlertFormChange,
  onSubmit,
  onDelete,
}: AlertsPanelProps) {
  return (
    <div className="space-y-6">
      {showAlertForm ? (
        <form onSubmit={onSubmit} className="bg-binance-surface rounded-2xl border border-binance-border p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-binance-brand" />
            <h3 className="text-lg leading-6 font-medium">Create price alert</h3>
          </div>

          <div>
            <label className="block text-sm leading-5 text-binance-secondary mb-2">Select asset</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-binance-secondary" />
              <input
                type="text"
                value={assetSearch}
                onChange={(e) => onAssetSearchChange(e.target.value)}
                placeholder="Search assets..."
                className="w-full h-11 rounded-xl border border-binance-border bg-binance-bg px-3 pl-10 text-sm text-binance-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60"
              />
            </div>
            {assetSearch ? (
              <div className="mt-2 max-h-40 overflow-y-auto border border-binance-border rounded-xl">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onAlertFormChange({
                        ...alertForm,
                        assetId: asset.id,
                        assetSymbol: asset.symbol,
                        assetName: asset.name,
                      });
                      onAssetSearchChange("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-binance-bg transition-colors flex justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60 ${
                      alertForm.assetId === asset.id ? "bg-binance-bg" : ""
                    }`}
                  >
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-binance-secondary">{asset.name}</span>
                  </button>
                ))}
                {filteredAssets.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-binance-secondary">No assets found</div>
                ) : null}
              </div>
            ) : null}
            {alertForm.assetId ? <p className="text-sm text-binance-up mt-2">Selected: {alertForm.assetSymbol}</p> : null}
            {assets.length === 0 ? (
              <Link href="/dashboard" className="text-sm text-binance-brand hover:underline mt-2 inline-block">
                Add assets to your portfolio first →
              </Link>
            ) : null}
          </div>

          <div>
            <label className="block text-sm leading-5 text-binance-secondary mb-1">Alert price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={alertForm.triggerValue}
              onChange={(e) =>
                onAlertFormChange({
                  ...alertForm,
                  triggerValue: e.target.value,
                })
              }
              placeholder="e.g. 150.00"
              className="w-full h-11 rounded-xl border border-binance-border bg-binance-bg px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60"
              required
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-binance-brand/5 border border-binance-brand/20 rounded-xl">
            <Info className="w-4 h-4 text-binance-brand shrink-0 mt-0.5" />
            <p className="text-xs leading-4 text-binance-secondary">
              You&apos;ll receive a Telegram notification when {alertForm.assetSymbol || "the asset"} reaches this price.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={saving || !alertForm.assetId || !alertForm.triggerValue}
              className="h-11 px-5 rounded-xl bg-binance-brand text-black hover:bg-binance-brand/90 font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </form>
      ) : null}

      {alerts.length === 0 && !showAlertForm ? (
        <div className="flex justify-center">
          <div className="w-full max-w-xl bg-binance-surface rounded-2xl border border-binance-border p-8 text-center">
            <Bell className="w-10 h-10 text-binance-secondary mx-auto mb-3" />
            <h3 className="text-xl leading-7 font-medium text-binance-text mb-2">No price alerts</h3>
            <p className="text-sm leading-5 text-binance-secondary">Use "New Alert" above to create your first alert.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-binance-surface rounded-2xl border border-binance-border p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${alert.isActive ? "bg-binance-brand/20" : "bg-binance-bg"}`}>
                  <TrendingUp className={`w-5 h-5 ${alert.isActive ? "text-binance-brand" : "text-binance-secondary"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-6 font-medium">{alert.assetSymbol}</span>
                    <span className="text-xs leading-4 text-binance-secondary uppercase bg-binance-bg px-2 py-0.5 rounded-md">
                      {alert.assetType}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-binance-secondary mt-1">
                    {alert.triggerType === "PRICE_LIMIT" ? `Alert at ₹${alert.triggerValue}` : `Scheduled: ${alert.triggerValue}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs leading-4 px-2 py-1 rounded-full font-medium ${
                    alert.isActive
                      ? "bg-binance-up/10 text-binance-up border border-binance-up/20"
                      : "bg-binance-secondary/10 text-binance-secondary border border-binance-secondary/20"
                  }`}
                >
                  {alert.isActive ? "Active" : "Muted"}
                </span>
                <button
                  onClick={() => onDelete(alert.id)}
                  className="h-9 px-3 rounded-lg text-sm text-binance-secondary hover:text-binance-down hover:bg-binance-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-down/60"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

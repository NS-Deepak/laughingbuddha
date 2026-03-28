import Link from "next/link";
import { Calendar, Clock, Loader2, Send, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAYS } from "./constants";
import type { Asset, Schedule, ScheduleFormState } from "./types";

interface DigestsPanelProps {
  schedules: Schedule[];
  assets: Asset[];
  showScheduleForm: boolean;
  saving: boolean;
  scheduleForm: ScheduleFormState;
  onScheduleFormChange: (next: ScheduleFormState) => void;
  onToggleDay: (day: number) => void;
  onToggleAsset: (assetId: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onSendNow: (scheduleId: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export function DigestsPanel({
  schedules,
  assets,
  showScheduleForm,
  saving,
  scheduleForm,
  onScheduleFormChange,
  onToggleDay,
  onToggleAsset,
  onSubmit,
  onSendNow,
  onDelete,
}: DigestsPanelProps) {
  return (
    <div className="space-y-6">
      {showScheduleForm ? (
        <form onSubmit={onSubmit} className="bg-binance-surface rounded-2xl border border-binance-border p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-binance-brand" />
            <h3 className="text-lg leading-6 font-medium">Create scheduled digest</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm leading-5 text-binance-secondary mb-1">Name</label>
              <input
                type="text"
                value={scheduleForm.name}
                onChange={(e) => onScheduleFormChange({ ...scheduleForm, name: e.target.value })}
                className="w-full h-11 rounded-xl border border-binance-border bg-binance-bg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm leading-5 text-binance-secondary mb-1">Time</label>
              <input
                type="time"
                value={scheduleForm.targetTime}
                onChange={(e) => onScheduleFormChange({ ...scheduleForm, targetTime: e.target.value })}
                className="w-full h-11 rounded-xl border border-binance-border bg-binance-bg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm leading-5 text-binance-secondary mb-2">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => onToggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60 ${
                    scheduleForm.daysOfWeek.includes(day.value)
                      ? "bg-binance-brand text-black"
                      : "bg-binance-bg text-binance-secondary border border-binance-border"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm leading-5 text-binance-secondary mb-2">Assets</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onToggleAsset(asset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60 ${
                    scheduleForm.assetIds.includes(asset.id)
                      ? "bg-binance-brand text-black font-medium"
                      : "bg-binance-bg text-binance-text border border-binance-border"
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
            {assets.length === 0 ? (
              <Link href="/dashboard" className="text-sm text-binance-brand hover:underline mt-2 inline-block">
                Add assets to your portfolio first →
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={saving || scheduleForm.assetIds.length === 0}
              className="h-11 px-5 rounded-xl bg-binance-brand text-black hover:bg-binance-brand/90 font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Creating..." : "Create Digest"}
            </Button>
          </div>
        </form>
      ) : null}

      {schedules.length === 0 && !showScheduleForm ? (
        <div className="bg-binance-surface rounded-2xl border border-binance-border p-10 text-center">
          <Calendar className="w-12 h-12 text-binance-secondary mx-auto mb-4" />
          <h3 className="text-2xl leading-8 font-medium text-binance-text mb-2">No scheduled digests</h3>
          <p className="text-sm leading-5 text-binance-secondary">Use "New Digest" above to create your first digest.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-binance-surface rounded-2xl border border-binance-border p-6">
              <div className="flex justify-between items-start gap-6 mb-4">
                <div>
                  <h3 className="text-xl leading-7 font-medium text-binance-text">{schedule.name}</h3>
                  <div className="flex items-center flex-wrap gap-2 text-sm leading-5 text-binance-secondary mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{schedule.targetTime}</span>
                    <span>|</span>
                    <span>{schedule.daysOfWeek.map((d) => DAYS.find((day) => day.value === d)?.label).join(", ")}</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    schedule.isActive
                      ? "bg-binance-up/10 text-binance-up border border-binance-up/20"
                      : "bg-binance-secondary/10 text-binance-secondary border border-binance-secondary/20"
                  }`}
                >
                  {schedule.isActive ? "Active" : "Paused"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {schedule.assets?.map((scheduleAsset) => (
                  <span
                    key={scheduleAsset.asset.symbol}
                    className="text-xs leading-4 bg-binance-bg border border-binance-border px-2.5 py-1 rounded-lg"
                  >
                    {scheduleAsset.asset.symbol}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-binance-border">
                <button
                  onClick={() => void onSendNow(schedule.id)}
                  className="h-9 px-3 rounded-lg text-sm text-binance-secondary hover:text-binance-brand hover:bg-binance-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-brand/60"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Send now
                  </span>
                </button>
                <button
                  onClick={() => onDelete(schedule.id)}
                  className="h-9 px-3 rounded-lg text-sm text-binance-secondary hover:text-binance-down hover:bg-binance-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-binance-down/60"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

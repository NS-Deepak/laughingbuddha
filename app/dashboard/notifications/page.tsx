'use client';

import { AlertsPanel } from "@/components/dashboard/notifications/AlertsPanel";
import { DeleteConfirmModal } from "@/components/dashboard/notifications/DeleteConfirmModal";
import { DigestsPanel } from "@/components/dashboard/notifications/DigestsPanel";
import { NotificationsHeader } from "@/components/dashboard/notifications/NotificationsHeader";
import { NotificationsStats } from "@/components/dashboard/notifications/NotificationsStats";
import { NotificationTabs } from "@/components/dashboard/notifications/NotificationTabs";
import { SkeletonCard } from "@/components/dashboard/notifications/SkeletonCard";
import { Toast } from "@/components/dashboard/notifications/Toast";
import { useNotificationsPage } from "@/components/dashboard/notifications/useNotificationsPage";
import { Button } from "@/components/ui/button";
import { Plus, X, Lock } from "lucide-react";
import { useTier, canAddAlert, canAddSchedule } from "@/lib/use-tier";
import Link from "next/link";

export default function NotificationsPage() {
  const { tier, limits, isLoading: tierLoading } = useTier();
  const {
    isLoaded,
    activeTab,
    setActiveTab,
    alerts,
    alertsLoading,
    schedules,
    schedulesLoading,
    assets,
    filteredAssets,
    showScheduleForm,
    setShowScheduleForm,
    showAlertForm,
    setShowAlertForm,
    showDeleteModal,
    setShowDeleteModal,
    toast,
    setToast,
    assetSearch,
    setAssetSearch,
    scheduleForm,
    setScheduleForm,
    alertForm,
    setAlertForm,
    saving,
    toggleDay,
    toggleAsset,
    submitSchedule,
    submitAlert,
    sendNow,
    confirmDelete,
  } = useNotificationsPage();

  const activeAlertCount = alerts.filter((alert) => alert.isActive).length;
  const activeDigestCount = schedules.filter((schedule) => schedule.isActive).length;

  // Tier-based access checks
  const canCreateAlert = !tierLoading && canAddAlert({ tier, limits, isLoading: false }, alerts.length);
  const canCreateSchedule = !tierLoading && limits.scheduledAlerts && canAddSchedule({ tier, limits, isLoading: false }, schedules.length);
  const showUpgradePrompt = tier === 'FREE' && !limits.scheduledAlerts;

  if (!isLoaded || alertsLoading || schedulesLoading || tierLoading) {
    return (
      <div className="min-h-screen bg-binance-bg text-binance-text pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1240px] py-8 space-y-6">
          <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-binance-surface rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-binance-surface rounded animate-pulse" />
            <div className="h-4 w-56 bg-binance-surface rounded animate-pulse" />
          </div>
        </div>
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const isAlertsView = activeTab === "alerts";
  const isAlertsFormOpen = isAlertsView && showAlertForm;
  const isDigestsFormOpen = !isAlertsView && showScheduleForm;
  const isCurrentFormOpen = isAlertsFormOpen || isDigestsFormOpen;

  return (
    <div className="min-h-screen bg-binance-bg text-binance-text pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1240px] py-8 space-y-6">
        <NotificationsHeader />

        <NotificationTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setShowAlertForm(false);
            setShowScheduleForm(false);
          }}
          activeAlertCount={activeAlertCount}
          activeDigestCount={activeDigestCount}
        />

        <div className="pt-2">
          {/* Show upgrade prompt for Free tier trying to access scheduled digests */}
          {!isAlertsView && showUpgradePrompt && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div className="flex-1">
                  <p className="text-amber-200 font-medium">Scheduled Digests require Pro</p>
                  <p className="text-amber-300/70 text-sm">Upgrade to create automated price digests</p>
                </div>
                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  <Link href="/dashboard/plans">Upgrade</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Disable button if limit reached */}
          {(isAlertsView && !canCreateAlert) || (!isAlertsView && !canCreateSchedule) ? (
            <div className="relative">
              <Button
                disabled
                className="h-11 px-5 rounded-xl bg-binance-surface text-binance-text/50 font-semibold cursor-not-allowed"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isAlertsView ? `Limit: ${limits.maxAlerts} alerts` : `Limit: ${limits.maxSchedules} digests`}
              </Button>
              <div className="absolute left-0 -bottom-8 text-xs text-binance-text/50">
                <Link href="/dashboard/plans" className="text-binance-brand hover:underline">
                  Upgrade for more
                </Link>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (isAlertsView) {
                  setShowAlertForm(!showAlertForm);
                  setShowScheduleForm(false);
                } else {
                  setShowScheduleForm(!showScheduleForm);
                  setShowAlertForm(false);
                }
              }}
              className="h-11 px-5 rounded-xl bg-binance-brand text-black hover:bg-binance-brand/90 font-semibold focus-visible:ring-2 focus-visible:ring-binance-brand/60"
            >
              {isCurrentFormOpen ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {isAlertsView ? "New Alert" : "New Digest"}
                </>
              )}
            </Button>
          )}
        </div>

        {isAlertsView ? (
          <AlertsPanel
            alerts={alerts}
            assets={assets}
            filteredAssets={filteredAssets}
            showAlertForm={showAlertForm}
            saving={saving}
            assetSearch={assetSearch}
            alertForm={alertForm}
            onAssetSearchChange={setAssetSearch}
            onAlertFormChange={setAlertForm}
            onSubmit={submitAlert}
            onDelete={(id) => setShowDeleteModal({ type: "alert", id })}
          />
        ) : (
          <DigestsPanel
            schedules={schedules}
            assets={assets}
            showScheduleForm={showScheduleForm}
            saving={saving}
            scheduleForm={scheduleForm}
            onScheduleFormChange={setScheduleForm}
            onToggleDay={toggleDay}
            onToggleAsset={toggleAsset}
            onSubmit={submitSchedule}
            onSendNow={sendNow}
            onDelete={(id) => setShowDeleteModal({ type: "schedule", id })}
          />
        )}

        <NotificationsStats activeAlertCount={activeAlertCount} activeDigestCount={activeDigestCount} />
      </div>

      <DeleteConfirmModal
        open={Boolean(showDeleteModal)}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete this item?"
        message="This action cannot be undone. The alert or schedule will be permanently removed."
      />

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

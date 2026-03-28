'use client';

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type {
  ActiveTab,
  AlertFormState,
  Asset,
  DeleteTarget,
  PriceAlert,
  Schedule,
  ScheduleFormState,
  ToastState,
} from "./types";

const defaultScheduleForm: ScheduleFormState = {
  name: "Morning Update",
  targetTime: "09:00",
  daysOfWeek: [1, 2, 3, 4, 5],
  assetIds: [],
};

const defaultAlertForm: AlertFormState = {
  assetId: "",
  assetSymbol: "",
  assetName: "",
  triggerValue: "",
};

export function useNotificationsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>("alerts");
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<DeleteTarget>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [assetSearch, setAssetSearch] = useState("");
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(defaultScheduleForm);
  const [alertForm, setAlertForm] = useState<AlertFormState>(defaultAlertForm);
  const [saving, setSaving] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/alerts?user_id=${user?.id}`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : data.alerts || []);
    } catch {
      setToast({ message: "Error fetching alerts", type: "error" });
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch {
      setToast({ message: "Error fetching schedules", type: "error" });
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch {
      setToast({ message: "Error fetching assets", type: "error" });
    }
  };

  const refresh = async () => {
    await Promise.all([fetchAlerts(), fetchSchedules(), fetchAssets()]);
  };

  useEffect(() => {
    if (isLoaded && user) {
      void refresh();
    }
  }, [isLoaded, user]);

  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
          asset.name.toLowerCase().includes(assetSearch.toLowerCase())
      ),
    [assetSearch, assets]
  );

  const toggleDay = (day: number) => {
    setScheduleForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const toggleAsset = (assetId: string) => {
    setScheduleForm((prev) => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter((id) => id !== assetId)
        : [...prev.assetIds, assetId],
    }));
  };

  const submitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });

      if (res.ok) {
        setToast({ message: "Schedule created!", type: "success" });
        setShowScheduleForm(false);
        await fetchSchedules();
        setScheduleForm(defaultScheduleForm);
      } else {
        setToast({ message: "Failed to create schedule", type: "error" });
      }
    } catch {
      setToast({ message: "Error creating schedule", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.assetId || !alertForm.triggerValue) return;

    setSaving(true);

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          asset_id: alertForm.assetId,
          asset_symbol: alertForm.assetSymbol,
          asset_name: alertForm.assetName,
          asset_type: "STOCK",
          trigger_type: "PRICE_LIMIT",
          trigger_value: alertForm.triggerValue,
        }),
      });

      if (res.ok) {
        setToast({ message: "Alert created!", type: "success" });
        setShowAlertForm(false);
        await fetchAlerts();
        setAlertForm(defaultAlertForm);
      } else {
        setToast({ message: "Failed to create alert", type: "error" });
      }
    } catch {
      setToast({ message: "Error creating alert", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const sendNow = async (scheduleId: string) => {
    try {
      const res = await fetch("/api/schedules/send-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });
      if (res.ok) {
        setToast({ message: "Sent to Telegram!", type: "success" });
      } else {
        setToast({ message: "Failed to send", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to send", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;

    const { type, id } = showDeleteModal;
    try {
      const endpoint = type === "alert" ? `/api/alerts/${id}` : `/api/schedules/${id}`;
      await fetch(endpoint, { method: "DELETE" });

      if (type === "alert") {
        await fetchAlerts();
        setToast({ message: "Alert deleted", type: "success" });
      } else {
        await fetchSchedules();
        setToast({ message: "Schedule deleted", type: "success" });
      }
    } catch {
      setToast({ message: "Failed to delete", type: "error" });
    } finally {
      setShowDeleteModal(null);
    }
  };

  return {
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
  };
}

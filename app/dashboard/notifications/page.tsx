'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ChevronLeft, Bell, Clock, Calendar, Plus, Trash2, Zap, X, 
  TrendingUp, Timer, Send, Settings, Info 
} from 'lucide-react';

// Types
interface PriceAlert {
  id: string;
  assetSymbol: string;
  assetName: string | null;
  assetType: string;
  triggerType: string;
  triggerValue: string;
  isActive: boolean;
}

interface Schedule {
  id: string;
  name: string;
  targetTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  assets: { asset: { symbol: string; name: string } }[];
}

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'alerts' | 'digests'>('alerts');
  
  // Price Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  
  // Schedule state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [assets, setAssets] = useState<{ id: string; symbol: string; name: string }[]>([]);
  
  // Form state
  const [scheduleForm, setScheduleForm] = useState({
    name: 'Morning Update',
    targetTime: '09:00',
    daysOfWeek: [1, 2, 3, 4, 5] as number[],
    assetIds: [] as string[],
  });
  
  const [alertForm, setAlertForm] = useState({
    assetId: '',
    assetSymbol: '',
    assetName: '',
    triggerValue: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  useEffect(() => {
    if (isLoaded && user) {
      fetchAlerts();
      fetchSchedules();
      fetchAssets();
    }
  }, [isLoaded, user]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/python/alerts?user_id=${user?.id}`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : (data.alerts || []));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm('Delete this alert?')) return;
    try {
      await fetch(`/api/python/alerts/${id}`, { method: 'DELETE' });
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const sendNow = async (scheduleId: string) => {
    if (!confirm('Send now to Telegram?')) return;
    setStatus({ type: '', message: 'Sending...' });
    try {
      const res = await fetch('/api/schedules/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Sent to Telegram!' });
      } else {
        setStatus({ type: 'error', message: 'Failed to send' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error sending' });
    }
  };

  const toggleDay = (day: number) => {
    setScheduleForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const toggleAsset = (assetId: string) => {
    setScheduleForm(prev => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter(id => id !== assetId)
        : [...prev.assetIds, assetId],
    }));
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Schedule created!' });
        setShowScheduleForm(false);
        fetchSchedules();
        setScheduleForm({ name: 'Morning Update', targetTime: '09:00', daysOfWeek: [1, 2, 3, 4, 5], assetIds: [] });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error creating schedule' });
    } finally {
      setSaving(false);
    }
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.assetId || !alertForm.triggerValue) return;
    
    setSaving(true);
    setStatus({ type: '', message: '' });
    
    try {
      const res = await fetch('/api/python/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          asset_id: alertForm.assetId,
          asset_symbol: alertForm.assetSymbol,
          asset_name: alertForm.assetName,
          asset_type: 'STOCK',
          trigger_type: 'PRICE_LIMIT',
          trigger_value: alertForm.triggerValue,
        }),
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Alert created!' });
        setShowAlertForm(false);
        fetchAlerts();
        setAlertForm({ assetId: '', assetSymbol: '', assetName: '', triggerValue: '' });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error creating alert' });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || alertsLoading || schedulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-binance-bg">
        <div className="text-binance-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-binance-bg text-binance-text pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-binance-secondary hover:text-binance-text">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-binance-brand">Notifications</h1>
            <p className="text-binance-secondary text-sm">Price alerts & scheduled digests</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-binance-border pb-2">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'alerts' 
              ? 'bg-binance-brand text-black' 
              : 'text-binance-secondary hover:text-binance-text'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Price Alerts
          <span className="ml-1 text-xs bg-black/20 px-1.5 py-0.5 rounded">
            {alerts.filter(a => a.isActive).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('digests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'digests' 
              ? 'bg-binance-brand text-black' 
              : 'text-binance-secondary hover:text-binance-text'
          }`}
        >
          <Timer className="w-4 h-4" />
          Scheduled Digests
          <span className="ml-1 text-xs bg-black/20 px-1.5 py-0.5 rounded">
            {schedules.filter(s => s.isActive).length}
          </span>
        </button>
      </div>

      {/* Price Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Create Alert Button */}
          <Button
            onClick={() => { setShowAlertForm(!showAlertForm); setShowScheduleForm(false); }}
            className="bg-binance-brand text-black hover:bg-binance-brand/90 font-bold"
          >
            {showAlertForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> New Alert</>}
          </Button>

          {/* Create Alert Form */}
          {showAlertForm && (
            <form onSubmit={handleAlertSubmit} className="bg-binance-surface rounded-xl border border-binance-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-binance-brand" />
                <h3 className="font-bold">Create Price Alert</h3>
              </div>
              
              <div>
                <label className="block text-xs text-binance-secondary mb-2">Select Asset</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {assets.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setAlertForm(prev => ({ ...prev, assetId: asset.id, assetSymbol: asset.symbol, assetName: asset.name }))}
                      className={`px-3 py-1.5 rounded text-xs ${
                        alertForm.assetId === asset.id
                          ? 'bg-binance-brand text-black font-medium'
                          : 'bg-binance-bg text-binance-text border border-binance-border'
                      }`}
                    >
                      {asset.symbol}
                    </button>
                  ))}
                </div>
                {assets.length === 0 && (
                  <p className="text-xs text-binance-secondary mt-2">Add assets to your portfolio first</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-binance-secondary mb-1">Alert Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertForm.triggerValue}
                  onChange={e => setAlertForm(prev => ({ ...prev, triggerValue: e.target.value }))}
                  placeholder="e.g. 150.00"
                  className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 text-sm font-mono"
                  required
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-binance-brand/5 border border-binance-brand/20 rounded-lg">
                <Info className="w-4 h-4 text-binance-brand shrink-0 mt-0.5" />
                <p className="text-[10px] text-binance-secondary leading-normal">
                  You'll receive a Telegram notification when {alertForm.assetSymbol || 'the asset'} reaches this price.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button type="submit" disabled={saving || !alertForm.assetId || !alertForm.triggerValue}>
                  {saving ? 'Creating...' : 'Create Alert'}
                </Button>
                {status.message && (
                  <span className={`text-sm ${status.type === 'success' ? 'text-binance-up' : 'text-binance-down'}`}>
                    {status.message}
                  </span>
                )}
              </div>
            </form>
          )}

          {alerts.length === 0 && !showAlertForm ? (
            <div className="bg-binance-surface rounded-xl border border-binance-border p-8 text-center">
              <Bell className="w-12 h-12 text-binance-secondary mx-auto mb-4" />
              <h3 className="font-bold text-binance-text mb-2">No price alerts</h3>
              <p className="text-sm text-binance-secondary">Create an alert from any asset page</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-binance-surface rounded-xl border border-binance-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${alert.isActive ? 'bg-binance-brand/20' : 'bg-binance-bg'}`}>
                      <TrendingUp className={`w-5 h-5 ${alert.isActive ? 'text-binance-brand' : 'text-binance-secondary'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{alert.assetSymbol}</span>
                        <span className="text-xs text-binance-secondary uppercase bg-binance-bg px-1.5 rounded">
                          {alert.assetType}
                        </span>
                      </div>
                      <p className="text-sm text-binance-secondary">
                        {alert.triggerType === 'PRICE_LIMIT' 
                          ? `Alert at $${alert.triggerValue}`
                          : `Scheduled: ${alert.triggerValue}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      alert.isActive 
                        ? 'bg-binance-up/10 text-binance-up border border-binance-up/20' 
                        : 'bg-binance-secondary/10 text-binance-secondary border border-binance-secondary/20'
                    }`}>
                      {alert.isActive ? 'Active' : 'Muted'}
                    </span>
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-binance-secondary hover:text-binance-down"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled Digests Tab */}
      {activeTab === 'digests' && (
        <div className="space-y-4">
          {/* Create Button */}
          <Button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="bg-binance-brand text-black hover:bg-binance-brand/90 font-bold"
          >
            {showScheduleForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> New Digest</>}
          </Button>

          {/* Create Form */}
          {showScheduleForm && (
            <form onSubmit={handleScheduleSubmit} className="bg-binance-surface rounded-xl border border-binance-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-binance-brand" />
                <h3 className="font-bold">Create Scheduled Digest</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-binance-secondary mb-1">Name</label>
                  <input
                    type="text"
                    value={scheduleForm.name}
                    onChange={e => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-binance-secondary mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduleForm.targetTime}
                    onChange={e => setScheduleForm(prev => ({ ...prev, targetTime: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-binance-secondary mb-2">Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded text-xs font-medium ${
                        scheduleForm.daysOfWeek.includes(day.value)
                          ? 'bg-binance-brand text-black'
                          : 'bg-binance-bg text-binance-secondary border border-binance-border'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-binance-secondary mb-2">Assets</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {assets.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => toggleAsset(asset.id)}
                      className={`px-3 py-1.5 rounded text-xs ${
                        scheduleForm.assetIds.includes(asset.id)
                          ? 'bg-binance-brand text-black font-medium'
                          : 'bg-binance-bg text-binance-text border border-binance-border'
                      }`}
                    >
                      {asset.symbol}
                    </button>
                  ))}
                </div>
                {assets.length === 0 && (
                  <p className="text-xs text-binance-secondary mt-2">Add assets to your portfolio first</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button type="submit" disabled={saving || scheduleForm.assetIds.length === 0}>
                  {saving ? 'Creating...' : 'Create Digest'}
                </Button>
                {status.message && (
                  <span className={`text-sm ${status.type === 'success' ? 'text-binance-up' : 'text-binance-down'}`}>
                    {status.message}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Schedule List */}
          {schedules.length === 0 && !showScheduleForm ? (
            <div className="bg-binance-surface rounded-xl border border-binance-border p-8 text-center">
              <Calendar className="w-12 h-12 text-binance-secondary mx-auto mb-4" />
              <h3 className="font-bold text-binance-text mb-2">No scheduled digests</h3>
              <p className="text-sm text-binance-secondary">Get daily updates at your preferred time</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {schedules.map(schedule => (
                <div key={schedule.id} className="bg-binance-surface rounded-xl border border-binance-border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{schedule.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-binance-secondary mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{schedule.targetTime}</span>
                        <span>•</span>
                        <span>{schedule.daysOfWeek.map(d => DAYS.find(dd => dd.value === d)?.label).join(', ')}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      schedule.isActive 
                        ? 'bg-binance-up/10 text-binance-up border border-binance-up/20' 
                        : 'bg-binance-secondary/10 text-binance-secondary border border-binance-secondary/20'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {schedule.assets?.map((sa: any) => (
                      <span key={sa.asset.symbol} className="text-xs bg-binance-bg border border-binance-border px-2 py-1 rounded">
                        {sa.asset.symbol}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-binance-border">
                    <button onClick={() => sendNow(schedule.id)} className="flex items-center gap-1 text-xs text-binance-brand hover:text-binance-brand/80">
                      <Send className="w-3 h-3" />
                      Send Now
                    </button>
                    <button onClick={() => deleteSchedule(schedule.id)} className="flex items-center gap-1 text-xs text-binance-down hover:text-binance-down/80">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div className="bg-binance-surface rounded-xl border border-binance-border p-4">
          <div className="flex items-center gap-2 text-binance-secondary text-xs mb-1">
            <Bell className="w-3 h-3" />
            Active Alerts
          </div>
          <span className="text-2xl font-bold">{alerts.filter(a => a.isActive).length}</span>
        </div>
        <div className="bg-binance-surface rounded-xl border border-binance-border p-4">
          <div className="flex items-center gap-2 text-binance-secondary text-xs mb-1">
            <Timer className="w-3 h-3" />
            Active Digests
          </div>
          <span className="text-2xl font-bold">{schedules.filter(s => s.isActive).length}</span>
        </div>
        <div className="bg-binance-surface rounded-xl border border-binance-border p-4">
          <div className="flex items-center gap-2 text-binance-secondary text-xs mb-1">
            <Settings className="w-3 h-3" />
            Telegram
          </div>
          <span className="text-2xl font-bold text-binance-up">Connected</span>
        </div>
      </div>
    </div>
  );
}

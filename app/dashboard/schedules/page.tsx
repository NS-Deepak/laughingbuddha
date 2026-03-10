'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Clock, Calendar, Plus, Trash2, Zap, X, Check } from 'lucide-react';

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

export default function SchedulesPage() {
  const { user, isLoaded } = useUser();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Morning Update',
    targetTime: '09:00',
    daysOfWeek: [1, 2, 3, 4, 5] as number[],
    assetIds: [] as string[],
  });
  const [assets, setAssets] = useState<{ id: string; symbol: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  useEffect(() => {
    if (isLoaded && user) {
      fetchSchedules();
      fetchAssets();
    }
  }, [isLoaded, user]);

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
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setStatus({ type: '', message: '' });
    
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Schedule created successfully!' });
        setShowForm(false);
        fetchSchedules();
        setFormData({
          name: 'Morning Update',
          targetTime: '09:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          assetIds: [],
        });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to create schedule' });
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      setStatus({ type: 'error', message: 'Error creating schedule' });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const toggleAsset = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter(id => id !== assetId)
        : [...prev.assetIds, assetId],
    }));
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const sendNow = async (scheduleId: string) => {
    if (!confirm('Send message NOW to Telegram?')) return;
    
    setStatus({ type: '', message: 'Sending...' });
    
    try {
      const res = await fetch('/api/schedules/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Message sent to Telegram!' });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to send' });
      }
    } catch (error) {
      console.error('Error sending:', error);
      setStatus({ type: 'error', message: 'Error sending message' });
    }
  };

  if (!isLoaded || loading) {
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
          <Link href="/dashboard" className="text-binance-secondary hover:text-binance-text transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-binance-brand">Scheduled Alerts</h1>
            <p className="text-binance-secondary text-sm">Set up recurring price updates</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-binance-brand text-black hover:bg-binance-brand/90 font-bold"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </>
          )}
        </Button>
        <Button
          onClick={async () => {
            if (!confirm('Run scheduler now?')) return;
            setStatus({ type: '', message: 'Running...' });
            try {
              const res = await fetch('/api/cron/trigger');
              const data = await res.json();
              setStatus({ 
                type: data.sent > 0 ? 'success' : 'error', 
                message: `Sent: ${data.sent}, Skipped: ${data.skipped}` 
              });
            } catch (e) {
              setStatus({ type: 'error', message: 'Error running scheduler' });
            }
          }}
          variant="outline"
          className="border-binance-brand text-binance-brand hover:bg-binance-brand/10"
        >
          <Zap className="w-4 h-4 mr-2" />
          Run Scheduler
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-binance-surface rounded-xl border border-binance-border p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-binance-brand" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Create New Schedule</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">Schedule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 py-2 text-sm text-binance-text placeholder:text-binance-secondary focus:outline-none focus:ring-2 focus:ring-binance-brand focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">Time (Your timezone)</label>
              <input
                type="time"
                value={formData.targetTime}
                onChange={(e) => setFormData(prev => ({ ...prev, targetTime: e.target.value }))}
                className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 py-2 text-sm text-binance-text focus:outline-none focus:ring-2 focus:ring-binance-brand focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">Days of Week</label>
            <div className="flex gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.daysOfWeek.includes(day.value)
                      ? 'bg-binance-brand text-black'
                      : 'bg-binance-bg text-binance-secondary hover:text-binance-text border border-binance-border'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">Assets to Include</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-binance-bg rounded-lg border border-binance-border">
              {assets.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => toggleAsset(asset.id)}
                  className={`px-3 py-2 rounded-md text-sm text-left transition-all ${
                    formData.assetIds.includes(asset.id)
                      ? 'bg-binance-brand text-black font-medium'
                      : 'bg-binance-surface text-binance-text hover:bg-binance-border'
                  }`}
                >
                  <span className="font-bold">{asset.symbol}</span>
                  <span className="text-xs text-binance-secondary ml-1">{asset.name}</span>
                </button>
              ))}
            </div>
            {assets.length === 0 && (
              <p className="text-sm text-binance-secondary mt-2">No assets in portfolio. Add some assets first.</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={saving || formData.assetIds.length === 0}
              className="bg-binance-brand text-black hover:bg-binance-brand/90 font-bold"
            >
              {saving ? 'Creating...' : 'Create Schedule'}
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
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="bg-binance-surface rounded-xl border border-binance-border p-12 text-center">
            <Calendar className="w-12 h-12 text-binance-secondary mx-auto mb-4" />
            <h3 className="font-bold text-binance-text mb-2">No schedules yet</h3>
            <p className="text-sm text-binance-secondary mb-4">Create a schedule to get daily price updates</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-binance-brand text-black hover:bg-binance-brand/90 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Schedule
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-binance-surface rounded-xl border border-binance-border p-5 hover:border-binance-brand/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-binance-text text-lg">{schedule.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-binance-secondary mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{schedule.targetTime}</span>
                      <span>•</span>
                      <span>{schedule.daysOfWeek.map(d => DAYS.find(dd => dd.value === d)?.label).join(', ')}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    schedule.isActive 
                      ? 'bg-binance-up/10 text-binance-up border border-binance-up/20' 
                      : 'bg-binance-secondary/10 text-binance-secondary border border-binance-secondary/20'
                  }`}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {schedule.assets?.map((sa: any) => (
                    <span key={sa.asset.symbol} className="text-xs bg-binance-bg border border-binance-border px-2 py-1 rounded text-binance-text">
                      {sa.asset.symbol}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-binance-border">
                  <button
                    onClick={() => sendNow(schedule.id)}
                    className="flex items-center gap-1 text-xs text-binance-brand hover:text-binance-brand/80 transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    Send Now
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="flex items-center gap-1 text-xs text-binance-down hover:text-binance-down/80 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-binance-surface rounded-xl border border-binance-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-binance-brand" />
            <span className="text-sm text-binance-secondary">Total Schedules</span>
          </div>
          <span className="text-2xl font-bold text-binance-text">{schedules.length}</span>
        </div>
        <div className="bg-binance-surface rounded-xl border border-binance-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-binance-brand" />
            <span className="text-sm text-binance-secondary">Active</span>
          </div>
          <span className="text-2xl font-bold text-binance-up">{schedules.filter(s => s.isActive).length}</span>
        </div>
        <div className="bg-binance-surface rounded-xl border border-binance-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-binance-brand" />
            <span className="text-sm text-binance-secondary">Assets Tracked</span>
          </div>
          <span className="text-2xl font-bold text-binance-text">
            {new Set(schedules.flatMap(s => s.assets?.map((a: any) => a.asset.symbol) || [])).size}
          </span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, User, Mail, Globe, MessageSquare, Clock, Check, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  telegramChatId: string | null;
  whatsappPhone: string | null;
  timezone: string;
  tier: string;
}

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', offset: '+5:30' },
  { value: 'America/New_York', label: 'America/New_York (EST)', offset: '-5:00' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)', offset: '-8:00' },
  { value: 'Europe/London', label: 'Europe/London (GMT)', offset: '+0:00' },
  { value: 'UTC', label: 'UTC', offset: '+0:00' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', offset: '+9:00' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)', offset: '+8:00' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)', offset: '+1:00' },
];

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setTelegramId(data.telegramChatId || '');
        setWhatsappPhone(data.whatsappPhone || '');
        setTimezone(data.timezone || 'Asia/Kolkata');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setStatus('idle');
    
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramChatId: telegramId || null,
          whatsappPhone: whatsappPhone || null,
          timezone,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatus('error');
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-binance-secondary hover:text-binance-text transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-binance-brand">Account Settings</h1>
          <p className="text-binance-secondary text-sm">Manage your profile and messaging preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <div className="bg-binance-surface rounded-xl border border-binance-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-binance-brand rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-binance-text">{user?.fullName || user?.firstName || 'User'}</h3>
                <p className="text-sm text-binance-secondary">{profile?.tier || 'FREE'} Plan</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-binance-secondary" />
                <span className="text-binance-secondary">{user?.primaryEmailAddress?.emailAddress || profile?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-binance-secondary" />
                <span className="text-binance-secondary">{TIMEZONES.find(tz => tz.value === timezone)?.label || timezone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-binance-secondary" />
                <span className="text-binance-secondary">{TIMEZONES.find(tz => tz.value === timezone)?.offset || ''}</span>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="bg-binance-surface rounded-xl border border-binance-border p-6">
            <h3 className="text-xs font-bold text-binance-secondary uppercase tracking-widest mb-4">Your Plan</h3>
            <div className="flex items-center justify-between">
              <span className="font-bold text-binance-brand text-lg">{profile?.tier || 'FREE'}</span>
              <span className="text-xs text-binance-secondary">Unlimited alerts</span>
            </div>
            <div className="w-full bg-binance-bg h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-binance-brand h-full w-full" />
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Telegram Settings */}
          <div className="bg-binance-surface rounded-xl border border-binance-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-binance-brand" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Telegram</h3>
              {profile?.telegramChatId ? (
                <span className="text-[10px] bg-binance-up/10 text-binance-up px-2 py-0.5 rounded border border-binance-up/20">CONNECTED</span>
              ) : (
                <span className="text-[10px] bg-binance-down/10 text-binance-down px-2 py-0.5 rounded border border-binance-down/20">NOT LINKED</span>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">Telegram Chat ID</label>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="Enter your Telegram Chat ID"
                  className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 py-2 text-sm text-binance-text placeholder:text-binance-secondary focus:outline-none focus:ring-2 focus:ring-binance-brand focus:border-transparent"
                />
                <p className="text-xs text-binance-secondary mt-2">
                  Start our bot and send /start to get your Chat ID
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="bg-binance-surface rounded-xl border border-binance-border p-6 opacity-75">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-binance-secondary" />
              <h3 className="font-bold text-sm uppercase tracking-wider">WhatsApp</h3>
              <span className="text-[10px] bg-binance-secondary/10 text-binance-secondary px-2 py-0.5 rounded border border-binance-secondary/20 font-bold uppercase italic">Coming Soon</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+1234567890"
                  disabled
                  className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg/50 px-3 py-2 text-sm text-binance-secondary placeholder:text-binance-secondary cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Timezone Settings */}
          <div className="bg-binance-surface rounded-xl border border-binance-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-binance-brand" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Preferences</h3>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-binance-secondary uppercase tracking-wider mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 rounded-lg border border-binance-border bg-binance-bg px-3 py-2 text-sm text-binance-text focus:outline-none focus:ring-2 focus:ring-binance-brand focus:border-transparent"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value} className="bg-binance-bg">
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-binance-secondary mt-2">
                All scheduled alerts will be sent in your local timezone
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-binance-brand text-black hover:bg-binance-brand/90 font-bold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {status === 'success' && (
              <span className="flex items-center gap-2 text-sm text-binance-up">
                <Check className="w-4 h-4" />
                Profile updated successfully!
              </span>
            )}
            
            {status === 'error' && (
              <span className="flex items-center gap-2 text-sm text-binance-down">
                <AlertCircle className="w-4 h-4" />
                Failed to update profile
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

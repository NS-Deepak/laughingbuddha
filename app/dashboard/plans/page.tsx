'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, AlertCircle, Loader2, Crown, Zap, Star } from 'lucide-react';

interface PlanDetails {
  tier: string;
  limits: {
    maxAlerts: number;
    maxAssets: number;
    maxSchedules: number;
    scheduledAlerts: boolean;
    whatsapp: boolean;
    prioritySupport: boolean;
  };
  usage: {
    alerts: number;
    assets: number;
    schedules: number;
  };
  usagePercentages: {
    alerts: number;
    assets: number;
    schedules: number;
  };
  allPlans: {
    [key: string]: {
      tier: string;
      name: string;
      description: string;
      features: string[];
      monthly: number;
      quarterly: number;
      yearly: number;
      limits: {
        maxAlerts: number;
        maxAssets: number;
        maxSchedules: number;
        scheduledAlerts: boolean;
        whatsapp: boolean;
        prioritySupport: boolean;
      };
    };
  };
}

export default function PlansPage() {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    if (isLoaded && user) {
      fetchPlanDetails();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    // Check for URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setStatus({ type: 'success', message: 'Payment successful! Your plan has been upgraded.' });
      fetchPlanDetails(); // Refresh plan details
    } else if (params.get('canceled') === 'true') {
      setStatus({ type: 'error', message: 'Payment was canceled. Please try again.' });
    } else if (params.get('demo') === 'true') {
      setStatus({ type: 'error', message: 'Demo mode: Configure DODO_API_KEY to enable payments.' });
    }
  }, []);

  const fetchPlanDetails = async () => {
    try {
      const res = await fetch('/api/subscription/plan');
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    if (!user) return;

    setProcessing(tier);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to create checkout' });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setStatus({ type: 'error', message: 'Failed to process upgrade' });
    } finally {
      setProcessing(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTier = plan?.tier || 'FREE';

  return (
    <div className="container mx-auto py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Unlock more features with our Pro and Max plans
          </p>
        </div>

        {/* Status Message */}
        {status.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {status.message}
          </div>
        )}

        {/* Current Plan Usage */}
        {plan && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-card rounded-lg border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Current Usage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Alerts */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Alerts</span>
                  <span className="text-sm font-medium">
                    {plan.usage.alerts} / {plan.limits.maxAlerts === -1 ? '∞' : plan.limits.maxAlerts}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, plan.usagePercentages.alerts)}%` }}
                  />
                </div>
              </div>

              {/* Assets */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Assets</span>
                  <span className="text-sm font-medium">
                    {plan.usage.assets} / {plan.limits.maxAssets === -1 ? '∞' : plan.limits.maxAssets}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, plan.usagePercentages.assets)}%` }}
                  />
                </div>
              </div>

              {/* Schedules */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Schedules</span>
                  <span className="text-sm font-medium">
                    {plan.usage.schedules} / {plan.limits.maxSchedules === -1 ? '∞' : plan.limits.maxSchedules}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, plan.usagePercentages.schedules)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto">
          <div className="bg-secondary rounded-lg p-1 flex gap-1 sm:gap-0">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm transition-all whitespace-nowrap ${
                billingCycle === 'monthly' 
                  ? 'bg-background shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm transition-all whitespace-nowrap ${
                billingCycle === 'quarterly' 
                  ? 'bg-background shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm transition-all whitespace-nowrap ${
                billingCycle === 'yearly' 
                  ? 'bg-background shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Free Plan */}
          <div className={`relative p-4 sm:p-6 rounded-lg border ${currentTier === 'FREE' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
            {currentTier === 'FREE' && (
              <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-primary-foreground text-xs sm:text-sm rounded-full">
                Current
              </div>
            )}
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Free</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Perfect for getting started</p>
              <div className="text-2xl sm:text-3xl font-bold mt-3 sm:mt-4">$0</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Forever free</p>
            </div>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {plan?.allPlans.FREE.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Check className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full text-sm" disabled variant="outline">
              Current Plan
            </Button>
          </div>

          {/* Pro Plan */}
          <div className={`relative p-4 sm:p-6 rounded-lg border ${currentTier === 'PRO' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
            {currentTier === 'PRO' && (
              <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-primary-foreground text-xs sm:text-sm rounded-full">
                Current
              </div>
            )}
            <div className="absolute -top-2 sm:-top-3 right-2 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white text-xs rounded-full flex items-center gap-0.5 sm:gap-1">
              <Zap className="h-2.5 sm:h-3 w-2.5 sm:w-3" /> Popular
            </div>
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Pro</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">For serious investors</p>
              <div className="text-2xl sm:text-3xl font-bold mt-3 sm:mt-4">
                ${billingCycle === 'monthly' ? plan?.allPlans.PRO.monthly : billingCycle === 'quarterly' ? plan?.allPlans.PRO.quarterly : plan?.allPlans.PRO.yearly}
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : billingCycle === 'quarterly' ? 'qtr' : 'yr'}</span>
              </div>
            </div>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {plan?.allPlans.PRO.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Check className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full text-sm" 
              onClick={() => handleUpgrade('PRO')}
              disabled={currentTier === 'PRO' || processing !== null}
            >
              {processing === 'PRO' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : currentTier === 'PRO' ? (
                'Current Plan'
              ) : (
                'Upgrade to Pro'
              )}
            </Button>
          </div>

          {/* Max Plan */}
          <div className={`relative p-4 sm:p-6 rounded-lg border ${currentTier === 'MAX' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
            {currentTier === 'MAX' && (
              <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-primary-foreground text-xs sm:text-sm rounded-full">
                Current
              </div>
            )}
            <div className="absolute -top-2 sm:-top-3 right-2 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full flex items-center gap-0.5 sm:gap-1">
              <Crown className="h-2.5 sm:h-3 w-2.5 sm:w-3" /> Best Value
            </div>
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Max</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Unlimited everything</p>
              <div className="text-2xl sm:text-3xl font-bold mt-3 sm:mt-4">
                ${billingCycle === 'monthly' ? plan?.allPlans.MAX.monthly : billingCycle === 'quarterly' ? plan?.allPlans.MAX.quarterly : plan?.allPlans.MAX.yearly}
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : billingCycle === 'quarterly' ? 'qtr' : 'yr'}</span>
              </div>
            </div>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {plan?.allPlans.MAX.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Check className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full text-sm" 
              variant="secondary"
              onClick={() => handleUpgrade('MAX')}
              disabled={currentTier === 'MAX' || processing !== null}
            >
              {processing === 'MAX' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : currentTier === 'MAX' ? (
                'Current Plan'
              ) : (
                'Upgrade to Max'
              )}
            </Button>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

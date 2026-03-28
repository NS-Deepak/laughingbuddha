// Subscription tier limits configuration
// Used to gate features based on user's subscription plan

export type Tier = 'FREE' | 'PRO' | 'MAX';

export interface TierLimits {
  maxAlerts: number;        // -1 means unlimited
  maxAssets: number;
  maxSchedules: number;
  priceAlerts: boolean;     // Price threshold alerts
  scheduledAlerts: boolean; // Time-based digest alerts
  telegram: boolean;         // Telegram notifications
  whatsapp: boolean;        // WhatsApp notifications
  emailSupport: boolean;
  prioritySupport: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  FREE: {
    maxAlerts: 3,
    maxAssets: 100,
    maxSchedules: 1,
    priceAlerts: true,
    scheduledAlerts: false,
    telegram: true,
    whatsapp: false,
    emailSupport: true,
    prioritySupport: false,
  },
  PRO: {
    maxAlerts: 20,
    maxAssets: 100,
    maxSchedules: 5,
    priceAlerts: true,
    scheduledAlerts: true,
    telegram: true,
    whatsapp: true,
    emailSupport: true,
    prioritySupport: false,
  },
  MAX: {
    maxAlerts: -1, // unlimited
    maxAssets: 100,
    maxSchedules: -1,
    priceAlerts: true,
    scheduledAlerts: true,
    telegram: true,
    whatsapp: true,
    emailSupport: true,
    prioritySupport: true,
  },
};

// Plan pricing (in USD)
export const PLAN_PRICING: Record<Tier, { monthly: number; quarterly: number; yearly: number }> = {
  FREE: { monthly: 0, quarterly: 0, yearly: 0 },
  PRO: { monthly: 2.00, quarterly: 6.00, yearly: 20.00 },
  MAX: { monthly: 5.00, quarterly: 15.00, yearly: 50.00 },
};

// Plan display names and descriptions
export const PLAN_INFO: Record<Tier, { name: string; description: string; features: string[] }> = {
  FREE: {
    name: 'Free',
    description: 'Perfect for getting started',
    features: [
      '100 assets in portfolio',
      '3 price alerts',
      '1 scheduled digest',
      'Telegram notifications',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    description: 'For serious investors',
    features: [
      '100 assets in portfolio',
      '20 price alerts',
      '5 scheduled digests',
      'Telegram + WhatsApp',
      'Priority processing',
      'Email support',
    ],
  },
  MAX: {
    name: 'Max',
    description: 'Unlimited everything',
    features: [
      '100 assets in portfolio',
      'Unlimited alerts',
      'Unlimited schedules',
      'Telegram + WhatsApp',
      'Priority support',
    ],
  },
};

// Helper to check if a limit is reached
export function isLimitReached(current: number, limit: number): boolean {
  if (limit === -1) return false; // unlimited
  return current >= limit;
}

// Helper to get remaining limit
export function getRemainingLimit(current: number, limit: number): number {
  if (limit === -1) return -1; // unlimited
  return Math.max(0, limit - current);
}

// Subscription usage tracking helpers
// Used to check current usage against tier limits

import { prisma } from './db';
import { Tier, TIER_LIMITS, isLimitReached } from './subscription-limits';

export interface UsageStats {
  alertsCount: number;
  assetsCount: number;
  schedulesCount: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
  remaining: number;
}

// Get current user's usage stats
export async function getUserUsage(userId: string): Promise<UsageStats> {
  const [alertsCount, assetsCount, schedulesCount] = await Promise.all([
    prisma.alert.count({ where: { userId } }),
    prisma.asset.count({ where: { userId } }),
    prisma.schedule.count({ where: { userId } }),
  ]);

  return {
    alertsCount,
    assetsCount,
    schedulesCount,
  };
}

// Get user's current tier from database
export async function getUserTier(userId: string): Promise<Tier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  return (user?.tier as Tier) || 'FREE';
}

// Check if user can create an alert
export async function checkAlertLimit(userId: string): Promise<LimitCheckResult> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  const usage = await getUserUsage(userId);

  const allowed = !isLimitReached(usage.alertsCount, limits.maxAlerts);

  return {
    allowed,
    reason: allowed ? undefined : `You've reached your limit of ${limits.maxAlerts} alerts. Upgrade to Pro for more!`,
    current: usage.alertsCount,
    limit: limits.maxAlerts,
    remaining: limits.maxAlerts === -1 ? -1 : Math.max(0, limits.maxAlerts - usage.alertsCount),
  };
}

// Check if user can add an asset to portfolio
export async function checkAssetLimit(userId: string): Promise<LimitCheckResult> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  const usage = await getUserUsage(userId);

  const allowed = !isLimitReached(usage.assetsCount, limits.maxAssets);

  return {
    allowed,
    reason: allowed ? undefined : `You've reached your limit of ${limits.maxAssets} assets. Upgrade to Pro for more!`,
    current: usage.assetsCount,
    limit: limits.maxAssets,
    remaining: limits.maxAssets === -1 ? -1 : Math.max(0, limits.maxAssets - usage.assetsCount),
  };
}

// Check if user can create a schedule
export async function checkScheduleLimit(userId: string): Promise<LimitCheckResult> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  const usage = await getUserUsage(userId);

  const allowed = !isLimitReached(usage.schedulesCount, limits.maxSchedules);

  return {
    allowed,
    reason: allowed ? undefined : `You've reached your limit of ${limits.maxSchedules} schedules. Upgrade to Pro for more!`,
    current: usage.schedulesCount,
    limit: limits.maxSchedules,
    remaining: limits.maxSchedules === -1 ? -1 : Math.max(0, limits.maxSchedules - usage.schedulesCount),
  };
}

// Check if user has scheduled alerts feature
export async function hasScheduledAlerts(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return TIER_LIMITS[tier].scheduledAlerts;
}

// Check if user has WhatsApp notifications
export async function hasWhatsApp(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return TIER_LIMITS[tier].whatsapp;
}

// Check if user has priority support
export async function hasPrioritySupport(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return TIER_LIMITS[tier].prioritySupport;
}

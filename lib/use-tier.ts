'use client';

import { useEffect, useState } from 'react';
import { Tier, TIER_LIMITS, TierLimits } from './subscription-limits';

export interface UserTierInfo {
  tier: Tier;
  limits: TierLimits;
  isLoading: boolean;
}

export function useTier() {
  const [tierInfo, setTierInfo] = useState<UserTierInfo>({
    tier: 'FREE',
    limits: TIER_LIMITS.FREE,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchTier() {
      try {
        const res = await fetch('/api/subscription/plan');
        if (res.ok) {
          const data = await res.json();
          const tier = (data.tier || 'FREE') as Tier;
          setTierInfo({
            tier,
            limits: TIER_LIMITS[tier],
            isLoading: false,
          });
        } else {
          setTierInfo(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setTierInfo(prev => ({ ...prev, isLoading: false }));
      }
    }
    fetchTier();
  }, []);

  return tierInfo;
}

// Helper to check if user can access a feature
export function canUseFeature(feature: keyof TierLimits, tierInfo: UserTierInfo): boolean {
  if (tierInfo.isLoading) return false;
  return tierInfo.limits[feature] as boolean;
}

// Check if user can add more alerts
export function canAddAlert(tierInfo: UserTierInfo, currentCount: number): boolean {
  if (tierInfo.isLoading) return false;
  const { maxAlerts } = tierInfo.limits;
  if (maxAlerts === -1) return true; // unlimited
  return currentCount < maxAlerts;
}

// Check if user can add more assets
export function canAddAsset(tierInfo: UserTierInfo, currentCount: number): boolean {
  if (tierInfo.isLoading) return false;
  const { maxAssets } = tierInfo.limits;
  if (maxAssets === -1) return true; // unlimited
  return currentCount < maxAssets;
}

// Check if user can add more schedules
export function canAddSchedule(tierInfo: UserTierInfo, currentCount: number): boolean {
  if (tierInfo.isLoading) return false;
  const { maxSchedules } = tierInfo.limits;
  if (maxSchedules === -1) return true; // unlimited
  return currentCount < maxSchedules;
}

// Get remaining limit
export function getRemaining(tierInfo: UserTierInfo, currentCount: number, limitType: 'maxAlerts' | 'maxAssets' | 'maxSchedules'): number {
  if (tierInfo.isLoading) return 0;
  const limit = tierInfo.limits[limitType];
  if (limit === -1) return -1; // unlimited
  return Math.max(0, limit - currentCount);
}

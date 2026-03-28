'use client';

import { useEffect, useState } from 'react';

export interface UsageStats {
  alertsCount: number;
  assetsCount: number;
  schedulesCount: number;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageStats>({
    alertsCount: 0,
    assetsCount: 0,
    schedulesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        // This would call an API that aggregates usage stats
        // For now, we'll fetch from individual endpoints
        const [alertsRes, assetsRes, schedulesRes] = await Promise.all([
          fetch('/api/alerts').catch(() => ({ ok: false, json: () => ({ length: 0 }) })),
          fetch('/api/assets').catch(() => ({ ok: false, json: () => ({ length: 0 }) })),
          fetch('/api/schedules').catch(() => ({ ok: false, json: () => ({ length: 0 }) })),
        ]);

        const [alertsData, assetsData, schedulesData] = await Promise.all([
          alertsRes.ok ? alertsRes.json() : [],
          assetsRes.ok ? assetsRes.json() : [],
          schedulesRes.ok ? schedulesRes.json() : [],
        ]);

        setUsage({
          alertsCount: Array.isArray(alertsData) ? alertsData.length : 0,
          assetsCount: Array.isArray(assetsData) ? assetsData.length : 0,
          schedulesCount: Array.isArray(schedulesData) ? schedulesData.length : 0,
        });
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, []);

  return { usage, isLoading };
}

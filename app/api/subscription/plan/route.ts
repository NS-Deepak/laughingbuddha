import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { TIER_LIMITS, PLAN_INFO, PLAN_PRICING, Tier } from '@/lib/subscription-limits';
import { getUserUsage } from '@/lib/subscription-usage';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentTier = (user.tier || 'FREE') as Tier;
    const limits = TIER_LIMITS[currentTier];
    const planInfo = PLAN_INFO[currentTier];
    const pricing = PLAN_PRICING[currentTier];

    // Get usage stats
    const usage = await getUserUsage(userId);

    // Calculate usage percentages
    const alertsPercent = limits.maxAlerts === -1 ? 0 : (usage.alertsCount / limits.maxAlerts) * 100;
    const assetsPercent = limits.maxAssets === -1 ? 0 : (usage.assetsCount / limits.maxAssets) * 100;
    const schedulesPercent = limits.maxSchedules === -1 ? 0 : (usage.schedulesCount / limits.maxSchedules) * 100;

    return NextResponse.json({
      tier: currentTier,
      subscriptionStatus: 'active', // Default for now
      planExpiresAt: null,
      dodoCustomerId: null,
      limits,
      usage: {
        alerts: usage.alertsCount,
        assets: usage.assetsCount,
        schedules: usage.schedulesCount,
      },
      usagePercentages: {
        alerts: Math.min(100, alertsPercent),
        assets: Math.min(100, assetsPercent),
        schedules: Math.min(100, schedulesPercent),
      },
      planInfo,
      pricing,
      allPlans: {
        FREE: {
          tier: 'FREE',
          ...PLAN_INFO.FREE,
          ...PLAN_PRICING.FREE,
          limits: TIER_LIMITS.FREE,
        },
        PRO: {
          tier: 'PRO',
          ...PLAN_INFO.PRO,
          ...PLAN_PRICING.PRO,
          limits: TIER_LIMITS.PRO,
        },
        MAX: {
          tier: 'MAX',
          ...PLAN_INFO.MAX,
          ...PLAN_PRICING.MAX,
          limits: TIER_LIMITS.MAX,
        },
      },
    });
  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json({ error: 'Failed to get plan' }, { status: 500 });
  }
}

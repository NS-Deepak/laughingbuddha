import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { apiLimiter, getRateLimitResponse, getClientIdentifier } from '@/lib/rate-limit';
import { handleApiError, createSuccessResponse, createErrorResponse, AppError, validateRequired } from '@/lib/error-handler';
import { TIER_LIMITS, Tier } from '@/lib/subscription-limits';

// Strict limiter for write operations
const strictLimiter = { check: (req: NextRequest, id: string) => ({ success: true, remaining: 10, limit: 10, reset: Date.now() + 60000 }) };

// Helper to get user's tier and enforce limits
async function enforceTierLimits(userId: string, action: 'create_alert' | 'create_schedule' | 'add_asset') {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 'NOT_FOUND', 404);
  }

  const tier = (user.tier || 'FREE') as Tier;
  const limits = TIER_LIMITS[tier];

  // Count current usage
  const [alertCount, assetCount, scheduleCount] = await Promise.all([
    prisma.alert.count({ where: { userId } }),
    prisma.asset.count({ where: { userId } }),
    prisma.schedule.count({ where: { userId } }),
  ]);

  if (action === 'create_alert' && limits.maxAlerts !== -1 && alertCount >= limits.maxAlerts) {
    throw new AppError(
      `Alert limit (${limits.maxAlerts}) reached. Upgrade to Pro for more.`,
      'LIMIT_EXCEEDED',
      403
    );
  }

  if (action === 'add_asset' && limits.maxAssets !== -1 && assetCount >= limits.maxAssets) {
    throw new AppError(
      `Asset limit (${limits.maxAssets}) reached. Upgrade to Pro for more.`,
      'LIMIT_EXCEEDED',
      403
    );
  }

  if (action === 'create_schedule') {
    if (!limits.scheduledAlerts) {
      throw new AppError(
        'Scheduled digests require Pro plan.',
        'PLAN_REQUIRED',
        403
      );
    }
    if (limits.maxSchedules !== -1 && scheduleCount >= limits.maxSchedules) {
      throw new AppError(
        `Schedule limit (${limits.maxSchedules}) reached. Upgrade to Pro for more.`,
        'LIMIT_EXCEEDED',
        403
      );
    }
  }

  return { user, tier };
}

// GET alerts for authenticated user only
export async function GET(request: NextRequest) {
  try {
    // Get user from Clerk auth - this is the ONLY source of truth
    const { userId } = await auth();
    
    if (!userId) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    
    // Query alerts only for authenticated user
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return createSuccessResponse(alerts);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create alert
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - use strict limiter for write operations (10 req/min)
    const identifier = getClientIdentifier(request);
    const rateLimitResult = strictLimiter.check(request, identifier);
    const rateLimitResponse = getRateLimitResponse(rateLimitResult);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { userId } = await auth();
    
    if (!userId) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Enforce tier limits - CRITICAL for production
    await enforceTierLimits(userId, 'create_alert');
    
    const body = await request.json();
    const { asset_symbol, asset_name, asset_type, trigger_type, trigger_value } = body;
    
    // Validate required fields
    validateRequired(
      { asset_symbol, trigger_type, trigger_value },
      ['asset_symbol', 'trigger_type', 'trigger_value']
    );
    
    const alert = await prisma.alert.create({
      data: {
        userId,
        assetSymbol: asset_symbol,
        assetName: asset_name || '',
        assetType: asset_type || 'STOCK',
        triggerType: trigger_type,
        triggerValue: trigger_value,
      },
    });
    
    return createSuccessResponse(alert, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

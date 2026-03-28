import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { createAssetSchema } from '@/lib/validations';
import { TIER_LIMITS, Tier } from '@/lib/subscription-limits';
import { AppError } from '@/lib/error-handler';

// Self-review: Fixed - now using Zod validation from lib/validations.ts
// Previously was trusting client input without validation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tier and check limits
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const tier = (user?.tier || 'FREE') as Tier;
    const limits = TIER_LIMITS[tier];

    // Count current assets
    const assetCount = await prisma.asset.count({ where: { userId } });
    
    if (limits.maxAssets !== -1 && assetCount >= limits.maxAssets) {
      throw new AppError(
        `Asset limit (${limits.maxAssets}) reached. Upgrade to Pro for more.`,
        'LIMIT_EXCEEDED',
        403
      );
    }

    const body = await request.json();
    
    // Validate input with Zod
    const parsed = createAssetSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { symbol, name, assetType, exchange } = parsed.data;
    
    // Check if asset already exists
    const existing = await prisma.asset.findFirst({
      where: {
        userId,
        symbol,
      },
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Asset already in portfolio' }, { status: 400 });
    }
    
    // Create asset
    const asset = await prisma.asset.create({
      data: {
        userId,
        symbol,
        name,
        assetType,
        exchange,
      },
    });
    
    // Try to get current price
    let currentPrice = null;
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) {
          currentPrice = Number(price.toFixed(2));
        }
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    }
    
    return NextResponse.json({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      asset_type: asset.assetType,
      exchange: asset.exchange,
      added_at: asset.addedAt.toISOString(),
      current_price: currentPrice,
    });
  } catch (error) {
    console.error('Add portfolio error:', error);
    
    // Handle AppError specifically
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { symbol, name, asset_type, exchange } = body;
    
    if (!symbol || !name || !asset_type || !exchange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
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
        assetType: asset_type,
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
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 });
  }
}

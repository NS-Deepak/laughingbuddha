import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Handle both GET (portfolio by userId) and DELETE (delete asset by assetId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId: authUserId } = await auth();
    
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: userId } = await params;
    
    // Ensure user can only access their own portfolio
    if (userId !== authUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get user's assets from database
    const assets = await prisma.asset.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
    
    // Fetch live prices for each asset
    const results = await Promise.all(
      assets.map(async (asset) => {
        try {
          // Fetch price from Yahoo Finance
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${asset.symbol}?interval=1d&range=2d`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0',
              },
            }
          );
          
          let currentPrice = null;
          let priceChange24h = null;
          let currency = 'USD';
          
          if (response.ok) {
            const data = await response.json();
            const chart = data?.chart?.result?.[0];
            const meta = chart?.meta;
            const indicators = chart?.indicators?.quote?.[0];
            
            currentPrice = meta?.regularMarketPrice || null;
            currency = meta?.currency || 'USD';
            
            // Calculate 24h change
            if (indicators?.close?.length >= 2 && currentPrice) {
              const closes = indicators.close.filter((c: number) => c !== null);
              if (closes.length >= 2) {
                const prevClose = closes[closes.length - 2];
                priceChange24h = Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2));
              }
            }
          }
          
          return {
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            asset_type: asset.assetType,
            exchange: asset.exchange,
            added_at: asset.addedAt.toISOString(),
            current_price: currentPrice ? Number(currentPrice.toFixed(2)) : null,
            price_change_24h: priceChange24h,
            currency,
          };
        } catch (err) {
          console.error(`Error fetching ${asset.symbol}:`, err);
          return {
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            asset_type: asset.assetType,
            exchange: asset.exchange,
            added_at: asset.addedAt.toISOString(),
            current_price: null,
            price_change_24h: null,
            currency: 'USD',
          };
        }
      })
    );
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Portfolio error:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: assetId } = await params;
    
    // Delete only if user owns the asset
    await prisma.asset.delete({
      where: {
        id: assetId,
        userId, // ownership check
      },
    });
    
    return NextResponse.json({ status: 'deleted', id: assetId });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}

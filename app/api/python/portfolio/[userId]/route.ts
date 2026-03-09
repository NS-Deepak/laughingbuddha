import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
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
          
          if (response.ok) {
            const data = await response.json();
            const chart = data?.chart?.result?.[0];
            const meta = chart?.meta;
            const indicators = chart?.indicators?.quote?.[0];
            
            currentPrice = meta?.regularMarketPrice || null;
            
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

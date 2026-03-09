import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  
  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }
  
  try {
    // Use Yahoo Finance search API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json([]);
    }
    
    const data = await response.json();
    const quotes = data?.quotes || [];
    
    const results = quotes
      .filter((item: any) => item.symbol)
      .map((item: any) => {
        let assetType = 'STOCK';
        const quoteType = item.quoteType || '';
        const symbol = item.symbol || '';
        
        if (quoteType === 'CRYPTOCURRENCY') {
          assetType = 'CRYPTO';
        } else if (quoteType === 'INDEX' || symbol.startsWith('^')) {
          assetType = 'INDEX';
        }
        
        return {
          symbol: item.symbol,
          name: item.shortname || item.longname || item.symbol,
          type: assetType,
          exchange: item.exchange || 'Unknown',
          price: null,
        };
      });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json([]);
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Yahoo Finance ticker data
const TICKER_SYMBOLS = [
  { symbol: '^NSEI', name: 'NIFTY 50', display: 'NIFTY 50' },
  { symbol: 'BTC-USD', name: 'Bitcoin', display: 'BTC-USD' },
  { symbol: 'GC=F', name: 'Gold', display: 'GOLD' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', display: 'RELIANCE' },
  { symbol: 'TCS.NS', name: 'TCS', display: 'TCS' },
];

export async function GET() {
  try {
    const results = [];
    
    for (const item of TICKER_SYMBOLS) {
      try {
        // Use Yahoo Finance chart API (free, no API key needed)
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}?interval=1d&range=2d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const chart = data?.chart?.result?.[0];
        
        if (!chart) continue;
        
        const meta = chart.meta;
        const currentPrice = meta?.regularMarketPrice || 0;
        
        // Calculate 24h change
        let changePct = 0;
        const indicators = chart.indicators?.quote?.[0];
        if (indicators?.close?.length >= 2) {
          const closes = indicators.close.filter((c: number) => c !== null);
          if (closes.length >= 2) {
            const prevClose = closes[closes.length - 2];
            if (prevClose && currentPrice) {
              changePct = Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2));
            }
          }
        }
        
        results.push({
          symbol: item.display,
          name: item.name,
          price: Number(currentPrice.toFixed(2)),
          change_pct: changePct,
          is_up: changePct >= 0,
        });
      } catch (err) {
        console.error(`Error fetching ${item.symbol}:`, err);
        // Continue with other symbols
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Ticker error:', error);
    return NextResponse.json([]);
  }
}

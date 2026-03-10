import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Yahoo Finance API response types - Self-review: Added to fix 'any' type safety issue
const yahooQuoteSchema = z.object({
  symbol: z.string(),
  shortname: z.string().optional(),
  longname: z.string().optional(),
  quoteType: z.string().optional(),
  exchange: z.string().optional(),
});

const yahooSearchResponseSchema = z.object({
  quotes: z.array(yahooQuoteSchema).optional(),
});

type YahooQuote = z.infer<typeof yahooQuoteSchema>;

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
    
    const rawData = await response.json();
    
    // Validate response with Zod
    const parsed = yahooSearchResponseSchema.safeParse(rawData);
    if (!parsed.success) {
      console.error('Yahoo API response validation failed:', parsed.error);
      return NextResponse.json([]);
    }
    
    const quotes = parsed.data.quotes || [];
    
    const results = quotes
      .filter((item) => item.symbol)
      .map((item: YahooQuote) => {
        let assetType = 'STOCK';
        const quoteType = item.quoteType || '';
        const symbol = item.symbol || '';
        
        if (quoteType === 'CRYPTOCURRENCY' || (quoteType === 'CRYPTOCURRENCY' && symbol.endsWith('-USD'))) {
          assetType = 'CRYPTO';
        } else if (quoteType === 'ETF' || quoteType === 'MUTUALFUND') {
          assetType = 'STOCK';
        } else if (quoteType === 'INDEX' || symbol.startsWith('^') || quoteType === 'INDEX') {
          // Map indices to STOCK since we don't have an INDEX enum
          assetType = 'STOCK';
        } else if (quoteType === 'COMMODITY') {
          assetType = 'COMMODITY';
        } else {
          assetType = 'STOCK';
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

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendMessage } from '@/lib/telegram';

// Currency symbol based on Yahoo Finance currency
function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'GBP': return '£';
    case 'KRW': return '₩';
    case 'RUB': return '₽';
    case 'BRL': return 'R$';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    default: return '$';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    // Get schedule with assets
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, userId },
      include: {
        assets: {
          include: { asset: true }
        }
      }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Get user for Telegram chat ID
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.telegramChatId) {
      return NextResponse.json({ error: 'Telegram not linked' }, { status: 400 });
    }

    // Get asset symbols
    const symbols = schedule.assets.map((sa: any) => sa.asset.symbol);
    
    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No assets in schedule' }, { status: 400 });
    }

    // Fetch prices from Yahoo Finance
    const prices: Record<string, any> = {};
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        
        if (!response.ok) throw new Error('Failed');
        
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const prevClose = meta?.chartPreviousClose || meta?.previousClose;
        const price = meta?.regularMarketPrice;
        
        if (price) {
          const change = price - prevClose;
          const changePct = (change / prevClose) * 100;
          
          prices[symbol] = {
            name: schedule.assets.find((sa: any) => sa.asset.symbol === symbol)?.asset.name || symbol,
            price: Number(price.toFixed(2)),
            change: Number(change.toFixed(2)),
            change_pct: Number(changePct.toFixed(2)),
            currency: meta?.currency || 'USD'
          };
        } else {
          throw new Error('No price');
        }
      } catch (e) {
        prices[symbol] = {
          name: symbol,
          price: null,
          error: 'Failed to fetch'
        };
      }
    }

    // Get user's timezone
    const timezone = user.timezone || 'Asia/Kolkata';
    
    // Format message
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { timeZone: timezone, day: 'numeric', month: 'short', year: 'numeric' });

    let msg = `🕉️ *${schedule.name}*\n`;
    msg += `📅 ${dateStr} | 🕐 ${timeStr}\n`;
    msg += '━'.repeat(20) + '\n\n';

    for (const [symbol, data] of Object.entries(prices)) {
      if (!data.price) {
        msg += `⚠️ *${data.name}*: Error fetching price\n`;
        continue;
      }

      const prefix = getCurrencySymbol(data.currency);
      const trend = data.change_pct > 0 ? '📈' : data.change_pct < 0 ? '📉' : '➖';

      msg += `${trend} *${data.name}*\n`;
      msg += `   ${prefix}${data.price} (${data.change_pct >= 0 ? '+' : ''}${data.change_pct}%)\n\n`;
    }

    msg += '━'.repeat(20) + '\n';
    msg += '💎 Powered by LaughingBuddha';

    // Send message
    await sendMessage(user.telegramChatId, msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send now error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}

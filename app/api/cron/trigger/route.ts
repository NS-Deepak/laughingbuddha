// Scheduler endpoint - runs for 1 hour when clicked
// Checks every minute and sends Telegram messages at scheduled times

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

// Main endpoint - runs for 1 hour continuously
export async function GET() {
  const durationMs = 60 * 60 * 1000; // 1 hour
  const intervalMs = 60 * 1000; // 1 minute
  const endTime = Date.now() + durationMs;
  
  console.log('🔔 Starting continuous scheduler for 1 hour...');
  console.log('⏱️ Will run until:', new Date(endTime).toISOString());
  
  const results: any[] = [];
  
  while (Date.now() < endTime) {
    try {
      const result = await runSchedulerOnce();
      results.push({ time: new Date().toISOString(), sent: result.sent, skipped: result.skipped });
      console.log('📊 Run result:', result);
    } catch (error) {
      console.error('Scheduler error:', error);
      results.push({ time: new Date().toISOString(), error: 'Failed' });
    }
    
    // Wait for next interval
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  console.log('✅ 1-hour scheduler completed');
  return NextResponse.json({ 
    success: true, 
    message: 'Ran for 1 hour',
    results 
  });
}

// The actual scheduler logic - returns { sent, skipped }
async function runSchedulerOnce() {
  const { prisma } = await import('@/lib/db');
  const { sendMessage } = await import('@/lib/telegram');
  
  const now = new Date();
  
  const schedules = await prisma.schedule.findMany({
    where: { isActive: true },
    include: {
      user: true,
      assets: { include: { asset: true } }
    }
  });

  let sentCount = 0;
  let skipCount = 0;

  for (const schedule of schedules) {
    const user = schedule.user;
    
    if (!user?.telegramChatId) {
      skipCount++;
      continue;
    }

    const [targetHour, targetMin] = schedule.targetTime.split(':').map(Number);
    const tz = user.timezone || 'Asia/Kolkata';
    
    const nowStr = now.toLocaleString('en-US', { timeZone: tz });
    const nowLocal = new Date(nowStr);
    
    const dayOfWeek = nowLocal.getDay();
    const scheduleDays = schedule.daysOfWeek || [];
    const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    if (!scheduleDays.includes(isoDay)) {
      skipCount++;
      continue;
    }

    const targetTimeLocal = new Date(nowLocal);
    targetTimeLocal.setHours(targetHour, targetMin, 0, 0);
    
    const diffMs = nowLocal.getTime() - targetTimeLocal.getTime();
    const diffMins = diffMs / (1000 * 60);
    
    // Send at exactly scheduled time (within ±1 minute)
    if (diffMins < -1 || diffMins > 1) {
      skipCount++;
      continue;
    }

    const todayStr = nowLocal.toISOString().split('T')[0];
    if (schedule.lastSentDate === todayStr) {
      skipCount++;
      continue;
    }

    const symbols = schedule.assets.map((a: any) => a.asset.symbol);
    if (symbols.length === 0) {
      skipCount++;
      continue;
    }

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
        const price = meta?.regularMarketPrice;
        const prevClose = meta?.previousClose || meta?.chartPreviousClose;
        
        if (price && prevClose) {
          const change = price - prevClose;
          const changePct = (change / prevClose) * 100;
          
          prices[symbol] = {
            name: schedule.assets.find((a: any) => a.asset.symbol === symbol)?.asset.name || symbol,
            price: Number(price.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePct: Number(changePct.toFixed(2)),
            currency: meta?.currency || 'USD'
          };
        } else {
          throw new Error('No price');
        }
      } catch (e) {
        prices[symbol] = { name: symbol, price: null, error: true };
      }
    }

    const timeStr = nowLocal.toLocaleTimeString('en-US', { 
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
    const dateStr = nowLocal.toLocaleDateString('en-US', { 
      timeZone: tz,
      day: 'numeric', month: 'short', year: 'numeric'
    });

    let msg = `🕉️ *${schedule.name}*\n`;
    msg += `📅 ${dateStr} | 🕐 ${timeStr}\n`;
    msg += '━'.repeat(20) + '\n\n';

    for (const [symbol, data] of Object.entries(prices)) {
      if (!data.price) {
        msg += `⚠️ *${data.name}*: Error\n`;
        continue;
      }
      const prefix = getCurrencySymbol(data.currency);
      const trend = data.changePct > 0 ? '📈' : data.changePct < 0 ? '📉' : '➖';
      msg += `${trend} *${data.name}*\n`;
      msg += `   ${prefix}${data.price} (${data.changePct >= 0 ? '+' : ''}${data.changePct}%)\n\n`;
    }

    msg += '━'.repeat(20) + '\n';
    msg += '💎 Powered by LaughingBuddha';

    const success = await sendMessage(user.telegramChatId, msg);
    
    if (success) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { 
          lastSentAt: new Date(),
          lastSentDate: todayStr
        }
      });
      console.log(`✅ Sent ${schedule.name} to ${user.telegramChatId}`);
      sentCount++;
    } else {
      console.log(`❌ Failed to send ${schedule.name}`);
    }
  }

  return { sent: sentCount, skipped: skipCount, total: schedules.length };
}

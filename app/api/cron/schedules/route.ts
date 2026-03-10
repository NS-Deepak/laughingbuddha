// Simple cron endpoint - no GitHub Actions needed!
// Can be called by any interval/cron service

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { prisma } = await import('@/lib/db');
    const { sendMessage } = await import('@/lib/telegram');
    
    console.log('🔔 Running schedule check...');
    
    const now = new Date();
    
    // Get all active schedules
    const schedules = await prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        user: true,
        assets: {
          include: { asset: true }
        }
      }
    });

    console.log(`📋 Found ${schedules.length} active schedules`);

    let sentCount = 0;
    let skipCount = 0;

    for (const schedule of schedules) {
      const user = schedule.user;
      
      // Skip if no Telegram
      if (!user?.telegramChatId) {
        console.log(`⏭️ Skipping ${schedule.name} - no Telegram`);
        skipCount++;
        continue;
      }

      // Parse schedule time
      const [targetHour, targetMin] = schedule.targetTime.split(':').map(Number);
      
      // Get user's timezone offset (in minutes)
      const tz = user.timezone || 'Asia/Kolkata';
      
      // Create date in user's timezone
      const nowStr = now.toLocaleString('en-US', { timeZone: tz });
      const nowLocal = new Date(nowStr);
      
      // Check if today is a scheduled day
      const dayOfWeek = nowLocal.getDay(); // 0=Sun, 1=Mon
      const scheduleDays = schedule.daysOfWeek || [];
      
      // Convert to ISODOW (1=Mon, 7=Sun)
      const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      if (!scheduleDays.includes(isoDay)) {
        console.log(`⏭️ Skipping ${schedule.name} - not scheduled for today`);
        skipCount++;
        continue;
      }

      // Check if within 30-minute window after target time
      const targetTime = new Date(nowLocal);
      targetTime.setHours(targetHour, targetMin, 0, 0);
      
      const diffMs = nowLocal.getTime() - targetTime.getTime();
      const diffMins = diffMs / (1000 * 60);
      
      // Window: from target time to 30 minutes after
      if (diffMins < 0 || diffMins >= 30) {
        console.log(`⏭️ Skipping ${schedule.name} - outside window (${diffMins.toFixed(1)} mins)`);
        skipCount++;
        continue;
      }

      // Check if already sent today
      const todayStr = nowLocal.toISOString().split('T')[0];
      if (schedule.lastSentDate === todayStr) {
        console.log(`⏭️ Already sent ${schedule.name} today`);
        skipCount++;
        continue;
      }

      // Get asset symbols
      const symbols = schedule.assets.map(a => a.asset.symbol);
      
      if (symbols.length === 0) {
        console.log(`⏭️ Skipping ${schedule.name} - no assets`);
        skipCount++;
        continue;
      }

      // Fetch prices
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
              name: schedule.assets.find(a => a.asset.symbol === symbol)?.asset.name || symbol,
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

      // Format message
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
        const prefix = data.currency === 'INR' ? '₹' : '$';
        const trend = data.changePct > 0 ? '📈' : data.changePct < 0 ? '📉' : '➖';
        msg += `${trend} *${data.name}*\n`;
        msg += `   ${prefix}${data.price} (${data.changePct >= 0 ? '+' : ''}${data.changePct}%)\n\n`;
      }

      msg += '━'.repeat(20) + '\n';
      msg += '💎 Powered by LaughingBuddha';

      // Send message
      const success = await sendMessage(user.telegramChatId, msg);
      
      if (success) {
        // Mark as sent
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

    return Response.json({ 
      success: true, 
      sent: sentCount,
      skipped: skipCount,
      total: schedules.length
    });
  } catch (error) {
    console.error('Cron error:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

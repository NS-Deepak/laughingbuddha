import { NextRequest, NextResponse } from 'next/server';

// Simple cron endpoint for external services (cron-job.org)
// Runs ONCE per call - perfect for free cron services

export async function POST(request: NextRequest) {
  try {
    // Security check - optional token
    const token = request.headers.get('x-cron-token');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔔 External cron triggered, running scheduler once...');
    
    // Run the scheduler once
    const result = await runSchedulerOnce();
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      sent: result.sent,
      skipped: result.skipped
    });
  } catch (error) {
    console.error('External cron error:', error);
    return NextResponse.json({ 
      error: 'Scheduler failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'POST to trigger scheduler once',
    timestamp: new Date().toISOString()
  });
}

// Run scheduler logic inline
async function runSchedulerOnce() {
  const { prisma } = await import('@/lib/db');
  const { sendMessage } = await import('@/lib/telegram');
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday=0 to Sunday=7
  
  let sent = 0;
  let skipped = 0;
  
  try {
    // Get active price alerts
    const alerts = await prisma.alert.findMany({
      where: { isActive: true }
    });
    
    // Get user assets for price comparison
    const assets = await prisma.asset.findMany({
      include: { user: true }
    });
    
    // Check each alert
    for (const alert of alerts) {
      const asset = assets.find(a => a.symbol === alert.assetSymbol && a.userId === alert.userId);
      if (!asset) {
        skipped++;
        continue;
      }
      
      // For price alerts, we'd need to fetch current price
      // This is simplified - in production, fetch live prices
      const user = await prisma.user.findUnique({
        where: { id: alert.userId }
      });
      
      if (user?.telegramChatId && alert.triggerType === 'PRICE_LIMIT') {
        // Get current price from Yahoo or other API
        try {
          const priceResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/python/ticker?symbol=${alert.assetSymbol}`);
          const priceData = await priceResponse.json();
          const currentPrice = parseFloat(priceData.price || '0');
          const triggerPrice = parseFloat(alert.triggerValue);
          
          if (currentPrice > 0 && triggerPrice > 0) {
            const direction = currentPrice >= triggerPrice ? '📈 above' : '📉 below';
            await sendMessage(
              user.telegramChatId,
              `🔔 ${alert.assetSymbol} Alert!\n\nCurrent: $${currentPrice}\nTarget: $${triggerPrice}\nStatus: ${direction} target`
            );
            sent++;
          }
        } catch (e) {
          console.log('Could not fetch price for', alert.assetSymbol);
        }
      }
    }
    
    // Check scheduled digests
    const schedules = await prisma.schedule.findMany({
      where: { 
        isActive: true
      }
    });
    
    for (const schedule of schedules) {
      // Check if today is in the schedule's days
      const daysArray = schedule.daysOfWeek as number[];
      if (daysArray.includes(currentDay) && schedule.targetTime === currentTime) {
        const user = await prisma.user.findUnique({
          where: { id: schedule.userId }
        });
        
        if (user?.telegramChatId) {
          // Get assets for this schedule
          const scheduleAssets = await prisma.scheduleAsset.findMany({
            where: { scheduleId: schedule.id },
            include: { asset: true }
          });
          
          const assetList = scheduleAssets.map(sa => sa.asset.symbol).join(', ');
          await sendMessage(
            user.telegramChatId,
            `📊 Daily Digest - ${now.toDateString()}\n\nAssets: ${assetList || 'All'}\n\nYour scheduled update is ready!`
          );
          sent++;
        }
      }
    }
    
  } catch (error) {
    console.error('Scheduler error:', error);
  }
  
  return { sent, skipped };
}

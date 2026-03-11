import { NextRequest, NextResponse } from 'next/server';

// Simple cron endpoint for external services (cron-job.org)
// Runs once per call.

export async function POST(request: NextRequest) {
  try {
    // Security check - optional token
    const token = request.headers.get('x-cron-token');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('External cron triggered, running scheduler once...');

    const includeDebug = request.nextUrl.searchParams.get('debug') === '1';
    const result = await runSchedulerOnce(includeDebug);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sent: result.sent,
      skipped: result.skipped,
      ...(includeDebug ? { debug: result.debug } : {}),
    });
  } catch (error) {
    console.error('External cron error:', error);
    return NextResponse.json(
      {
        error: 'Scheduler failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'POST to trigger scheduler once',
    timestamp: new Date().toISOString(),
  });
}

function getLocalScheduleContext(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return {
    localDate: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
    localTime: `${getPart('hour')}:${getPart('minute')}`,
    localDay: weekdayMap[getPart('weekday')] ?? 0,
  };
}

// Run scheduler logic inline
async function runSchedulerOnce(_includeDebug: boolean) {
  const { prisma } = await import('@/lib/db');
  const { sendMessage } = await import('@/lib/telegram');

  const now = new Date();

  let sent = 0;
  let skipped = 0;
  const debug = {
    nowUtc: now.toISOString(),
    priceAlerts: {
      total: 0,
      sent: 0,
      skippedNoAsset: 0,
      skippedNoTelegram: 0,
      skippedNotPriceLimit: 0,
      skippedInvalidPrices: 0,
      fetchFailures: 0,
    },
    schedules: {
      total: 0,
      matchedWindow: 0,
      sent: 0,
      skippedWrongDayOrTime: 0,
      skippedAlreadySentToday: 0,
      skippedNoTelegram: 0,
      sample: [] as Array<{
        id: string;
        name: string;
        targetTime: string;
        localTime: string;
        localDay: number;
        timezone: string;
        reason: string;
      }>,
    },
  };
  const addScheduleSample = (entry: (typeof debug.schedules.sample)[number]) => {
    if (debug.schedules.sample.length < 8) {
      debug.schedules.sample.push(entry);
    }
  };

  try {
    // Get active price alerts
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
    });
    debug.priceAlerts.total = alerts.length;

    // Get user assets for price comparison
    const assets = await prisma.asset.findMany({
      include: { user: true },
    });

    // Check each price alert
    for (const alert of alerts) {
      const asset = assets.find((a) => a.symbol === alert.assetSymbol && a.userId === alert.userId);
      if (!asset) {
        skipped++;
        debug.priceAlerts.skippedNoAsset++;
        continue;
      }

      const user = await prisma.user.findUnique({
        where: { id: alert.userId },
      });

      if (!user?.telegramChatId) {
        skipped++;
        debug.priceAlerts.skippedNoTelegram++;
        continue;
      }

      if (alert.triggerType !== 'PRICE_LIMIT') {
        skipped++;
        debug.priceAlerts.skippedNotPriceLimit++;
        continue;
      }

      if (user.telegramChatId && alert.triggerType === 'PRICE_LIMIT') {
        try {
          const tickerBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const priceResponse = await fetch(`${tickerBase}/api/python/ticker?symbol=${alert.assetSymbol}`);
          const priceData = await priceResponse.json();
          const currentPrice = parseFloat(priceData.price || '0');
          const triggerPrice = parseFloat(alert.triggerValue);

          if (currentPrice > 0 && triggerPrice > 0) {
            const direction = currentPrice >= triggerPrice ? 'above' : 'below';
            await sendMessage(
              user.telegramChatId,
              `${alert.assetSymbol} Alert\n\nCurrent: $${currentPrice}\nTarget: $${triggerPrice}\nStatus: ${direction} target`
            );
            sent++;
            debug.priceAlerts.sent++;
          } else {
            skipped++;
            debug.priceAlerts.skippedInvalidPrices++;
          }
        } catch (e) {
          console.log('Could not fetch price for', alert.assetSymbol, e);
          skipped++;
          debug.priceAlerts.fetchFailures++;
        }
      }
    }

    // Check scheduled digests (timezone-aware + idempotent)
    const schedules = await prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        user: true,
        assets: {
          include: { asset: true },
        },
      },
    });
    debug.schedules.total = schedules.length;

    for (const schedule of schedules) {
      const daysArray = schedule.daysOfWeek as number[];
      const timezone = schedule.user?.timezone || 'UTC';
      const { localDate, localTime, localDay } = getLocalScheduleContext(now, timezone);

      if (!daysArray.includes(localDay) || schedule.targetTime !== localTime) {
        skipped++;
        debug.schedules.skippedWrongDayOrTime++;
        addScheduleSample({
          id: schedule.id,
          name: schedule.name,
          targetTime: schedule.targetTime,
          localTime,
          localDay,
          timezone,
          reason: 'wrong_day_or_time',
        });
        continue;
      }
      debug.schedules.matchedWindow++;

      // Idempotency guard: send only once per local day.
      const claim = await prisma.schedule.updateMany({
        where: {
          id: schedule.id,
          OR: [{ lastSentDate: null }, { lastSentDate: { not: localDate } }],
        },
        data: {
          lastSentAt: now,
          lastSentDate: localDate,
          updatedAt: now,
        },
      });

      if (claim.count === 0) {
        skipped++;
        debug.schedules.skippedAlreadySentToday++;
        addScheduleSample({
          id: schedule.id,
          name: schedule.name,
          targetTime: schedule.targetTime,
          localTime,
          localDay,
          timezone,
          reason: 'already_sent_today',
        });
        continue;
      }

      if (!schedule.user?.telegramChatId) {
        skipped++;
        debug.schedules.skippedNoTelegram++;
        addScheduleSample({
          id: schedule.id,
          name: schedule.name,
          targetTime: schedule.targetTime,
          localTime,
          localDay,
          timezone,
          reason: 'no_telegram_chat_id',
        });
        continue;
      }

      const assetList = schedule.assets.map((sa) => sa.asset.symbol).join(', ');
      await sendMessage(
        schedule.user.telegramChatId,
        `Daily Digest - ${localDate}\n\nAssets: ${assetList || 'All'}\n\nYour scheduled update is ready!`
      );
      sent++;
      debug.schedules.sent++;
      addScheduleSample({
        id: schedule.id,
        name: schedule.name,
        targetTime: schedule.targetTime,
        localTime,
        localDay,
        timezone,
        reason: 'sent',
      });
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }

  return { sent, skipped, debug };
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deliverRichScheduleMessage } from '@/lib/schedule-delivery';

// External cron endpoint for cron-job.org style pings.

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-cron-token');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

async function runSchedulerOnce(_includeDebug: boolean) {
  const now = new Date();

  let sent = 0;
  let skipped = 0;

  const debug = {
    nowUtc: now.toISOString(),
    schedules: {
      total: 0,
      matchedWindow: 0,
      sent: 0,
      formattedMessageType: 'rich' as const,
      totalPricedAssets: 0,
      totalFailedAssets: 0,
      skippedWrongDayOrTime: 0,
      skippedAlreadySentToday: 0,
      skippedNoTelegram: 0,
      skippedDeliveryFailed: 0,
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
    if (debug.schedules.sample.length < 10) {
      debug.schedules.sample.push(entry);
    }
  };

  try {
    const schedules = await prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        user: true,
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

      const result = await deliverRichScheduleMessage({
        scheduleId: schedule.id,
        userId: schedule.userId,
        now,
      });

      if (result.sent) {
        sent++;
        debug.schedules.sent++;
        debug.schedules.totalPricedAssets += result.pricedCount;
        debug.schedules.totalFailedAssets += result.failedCount;
        addScheduleSample({
          id: schedule.id,
          name: schedule.name,
          targetTime: schedule.targetTime,
          localTime,
          localDay,
          timezone,
          reason: 'sent',
        });
      } else {
        skipped++;
        if (result.reason === 'telegram_not_linked') {
          debug.schedules.skippedNoTelegram++;
        } else {
          debug.schedules.skippedDeliveryFailed++;
        }
        addScheduleSample({
          id: schedule.id,
          name: schedule.name,
          targetTime: schedule.targetTime,
          localTime,
          localDay,
          timezone,
          reason: result.reason || 'delivery_failed',
        });
      }
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }

  return { sent, skipped, debug };
}

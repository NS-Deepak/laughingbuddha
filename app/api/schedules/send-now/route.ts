import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deliverRichScheduleMessage } from '@/lib/schedule-delivery';

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

    const result = await deliverRichScheduleMessage({
      scheduleId,
      userId,
      now: new Date(),
    });

    if (!result.sent) {
      if (result.reason === 'schedule_not_found') {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
      }
      if (result.reason === 'telegram_not_linked') {
        return NextResponse.json({ error: 'Telegram not linked' }, { status: 400 });
      }
      if (result.reason === 'no_assets') {
        return NextResponse.json({ error: 'No assets in schedule' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      formattedMessageType: result.formattedMessageType,
      pricedCount: result.pricedCount,
      failedCount: result.failedCount,
      messagePreview: result.messagePreview,
    });
  } catch (error) {
    console.error('Send now error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendMessage } from '@/lib/telegram';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { telegramChatId: true }
  });

  if (!user?.telegramChatId) {
    return NextResponse.json(
      { error: 'Telegram not linked' },
      { status: 400 }
    );
  }

  try {
    await sendMessage(
      user.telegramChatId,
      '🕉️ Test message from LaughingBuddha!\n\nYour alerts are working correctly.'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}

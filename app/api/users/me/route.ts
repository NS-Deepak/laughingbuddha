import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  telegramChatId: z.string().regex(/^\d+$/, 'Must be numeric').optional(),
  timezone: z.string().refine((val) =>
    Intl.DateTimeFormat.supportedLocalesOf([val]).length > 0 ||
    ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'UTC'].includes(val),
    { message: 'Invalid IANA timezone' }
  ).optional(),
});

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { telegramChatId, timezone } = parsed.data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(telegramChatId !== undefined && { telegramChatId }),
      ...(timezone !== undefined && { timezone })
    }
  });

  return NextResponse.json(user);
}

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

  // Auto-create user if not exists (for first-time login)
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    // Create user with default values
    user = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.user`, // Placeholder email
        timezone: 'Asia/Kolkata',
      }
    });
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

  // Auto-create user if not exists (for PATCH)
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.user`,
        timezone: timezone || 'Asia/Kolkata',
        ...(telegramChatId && { telegramChatId }),
      }
    });
  } else {
    user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(telegramChatId !== undefined && { telegramChatId }),
        ...(timezone !== undefined && { timezone })
      }
    });
  }

  return NextResponse.json(user);
}

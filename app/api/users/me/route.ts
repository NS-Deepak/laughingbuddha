import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { convertLocalTimeToUtc, isValidIanaTimezone } from '@/lib/timezone';
import { TIER_LIMITS, Tier } from '@/lib/subscription-limits';
import { AppError } from '@/lib/error-handler';

const updateUserSchema = z.object({
  telegramChatId: z.string().regex(/^\d+$/, 'Must be numeric').optional(),
  whatsappPhone: z.string().regex(/^\d{10,15}$/, 'Must be valid WhatsApp number').optional(),
  timezone: z.string().refine((val) => isValidIanaTimezone(val), { message: 'Invalid IANA timezone' }).optional(),
});

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
  } catch (error: any) {
    console.error('Error in /api/users/me GET:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { telegramChatId, timezone } = parsed.data;

    // Get user's current tier for enforcement
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true }
    });
    const tier = (currentUser?.tier || 'FREE') as Tier;
    const limits = TIER_LIMITS[tier];

    // Handle WhatsApp - requires PRO tier
    let whatsappPhone: string | undefined = undefined;
    if (parsed.data.whatsappPhone !== undefined) {
      if (!limits.whatsapp) {
        throw new AppError(
          'WhatsApp notifications require Pro plan. Upgrade to enable WhatsApp.',
          'PLAN_REQUIRED',
          403
        );
      }
      whatsappPhone = parsed.data.whatsappPhone;
    }

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
          ...(whatsappPhone !== undefined && { whatsappPhone }),
          ...(timezone !== undefined && { timezone })
        }
      });
    }

    // If timezone changed, recalculate UTC time for all existing schedules.
    if (timezone !== undefined) {
      const schedules = await prisma.schedule.findMany({
        where: { userId },
        select: { id: true, targetTime: true }
      });

      for (const schedule of schedules) {
        const targetTimeUtc = convertLocalTimeToUtc(schedule.targetTime, timezone);
        try {
          await prisma.$executeRaw`UPDATE schedules SET target_time_utc = ${targetTimeUtc} WHERE id = ${schedule.id}`;
        } catch (error) {
          // Migration may not be applied yet; don't fail profile update.
          console.warn('Could not persist target_time_utc during timezone update:', error);
        }
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    // Handle AppError specifically
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error in /api/users/me PATCH:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

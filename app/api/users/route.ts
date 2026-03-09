import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateUserSchema } from '@/lib/validations';

// GET: Get current user
// P1 FIX: No user creation here - user should be created by Clerk webhook
export async function GET() {
  // P0 FIX: auth() is async
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Just fetch - don't create. User should exist from webhook.
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      // User might not be synced yet from webhook
      return NextResponse.json(
        { error: 'User not found. Please try again in a moment.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH: Update user preferences
export async function PATCH(request: NextRequest) {
  // P0 FIX: auth() is async
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // P1 FIX: Zod validation
    const parsed = updateUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
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
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createScheduleSchema } from '@/lib/validations';

// GET: Fetch user's schedules
export async function GET(request: NextRequest) {
  // P0 FIX: auth() is async
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId },
      include: {
        assets: {
          include: {
            asset: true
          }
        }
      },
      orderBy: { targetTime: 'asc' }
    });
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST: Create new schedule
export async function POST(request: NextRequest) {
  // P0 FIX: auth() is async
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // P1 FIX: Zod validation
    const parsed = createScheduleSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { name, targetTime, daysOfWeek, assetIds } = parsed.data;
    
    // Handle empty or invalid assetIds
    const validAssetIds = Array.isArray(assetIds) ? assetIds.filter(Boolean) : [];
    
    // Create schedule with linked assets
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        name,
        targetTime,
        daysOfWeek,
        assets: validAssetIds.length > 0 ? {
          create: validAssetIds.map((assetId) => ({
            asset: { connect: { id: assetId } }
          }))
        } : undefined
      },
      include: {
        assets: {
          include: { asset: true }
        }
      }
    });
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

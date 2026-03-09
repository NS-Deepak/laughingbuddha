import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateScheduleSchema } from '@/lib/validations';

// PATCH: Update schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // P0 FIX: auth() is async
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // P1 FIX: Zod validation
    const parsed = updateScheduleSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { name, targetTime, daysOfWeek, isActive, assetIds } = parsed.data;
    
    // P0 FIX: Use $transaction for atomicity
    // P0 FIX: Ownership check baked into update query
    const schedule = await prisma.$transaction(async (tx) => {
      // If updating assets, delete existing links first
      if (assetIds !== undefined) {
        await tx.scheduleAsset.deleteMany({
          where: { scheduleId: params.id }
        });
      }
      
      // P0 FIX: Ownership check IN the update query - one atomic operation
      const updated = await tx.schedule.update({
        where: { 
          id: params.id,
          userId // Combined ownership check
        },
        data: {
          ...(name !== undefined && { name }),
          ...(targetTime !== undefined && { targetTime }),
          ...(daysOfWeek !== undefined && { daysOfWeek }),
          ...(isActive !== undefined && { isActive }),
          ...(assetIds !== undefined && {
            assets: {
              create: assetIds.map((assetId) => ({
                asset: { connect: { id: assetId } }
              }))
            }
          }),
          updatedAt: new Date()
        },
        include: {
          assets: {
            include: { asset: true }
          }
        }
      });
      
      return updated;
    });
    
    return NextResponse.json(schedule);
    
  } catch (error: any) {
    // Handle "Record not found" (ownership mismatch or doesn't exist)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE: Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // P0 FIX: auth() is async
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // P0 FIX: Single delete with ownership check in WHERE
    await prisma.schedule.delete({
      where: { 
        id: params.id,
        userId // Ownership enforced in query
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}

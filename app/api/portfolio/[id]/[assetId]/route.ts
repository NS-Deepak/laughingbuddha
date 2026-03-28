import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { assetId } = await params;
    
    // Delete only if user owns the asset
    await prisma.asset.delete({
      where: {
        id: assetId,
        userId, // ownership check
      },
    });
    
    return NextResponse.json({ status: 'deleted', id: assetId });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}

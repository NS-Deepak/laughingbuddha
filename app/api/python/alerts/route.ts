import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET alerts for authenticated user only
// Self-review: Fixed security issue - was accepting user_id from URL params allowing data leaks
// Now uses Clerk auth to ensure users can only see their own alerts
export async function GET(request: NextRequest) {
  try {
    // Get user from Clerk auth - this is the ONLY source of truth
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Query alerts only for authenticated user
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// POST create alert
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { asset_symbol, asset_name, asset_type, trigger_type, trigger_value } = body;
    
    if (!asset_symbol || !trigger_type || !trigger_value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const alert = await prisma.alert.create({
      data: {
        userId,
        assetSymbol: asset_symbol,
        assetName: asset_name || '',
        assetType: asset_type || 'STOCK',
        triggerType: trigger_type,
        triggerValue: trigger_value,
      },
    });
    
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

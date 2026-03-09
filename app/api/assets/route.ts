import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { validateSymbol } from '@/lib/yahoo';

const createAssetSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  assetType: z.enum(['STOCK', 'CRYPTO', 'COMMODITY']),
  exchange: z.string().min(1),
});

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { symbol: 'asc' }
  });

  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createAssetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { symbol, name, assetType, exchange } = parsed.data;

  const isValid = await validateSymbol(symbol);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  try {
    const asset = await prisma.asset.create({
      data: {
        userId,
        symbol,
        name,
        assetType,
        exchange
      }
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Symbol already exists' }, { status: 409 });
    }
    throw error;
  }
}

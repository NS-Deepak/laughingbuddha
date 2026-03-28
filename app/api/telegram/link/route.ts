import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const TOKEN_TTL_MINUTES = 10;

async function ensureTelegramLinkTokensTable() {
  console.log('[telegram-link] Ensuring telegram_link_tokens table exists...');
  
  // First check if table already exists
  const tableExists = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'telegram_link_tokens'
    ) AS exists
  `;
  
  if (tableExists && (tableExists as any)[0]?.exists) {
    console.log('[telegram-link] Table already exists');
    return;
  }
  
  console.log('[telegram-link] Table does not exist, creating...');
  try {
    await prisma.$executeRaw`
      CREATE TABLE telegram_link_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP(3) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[telegram-link] Table created successfully');
  } catch (err) {
    console.error('[telegram-link] Error creating table:', err);
    throw err;
  }
  
  // Create indexes (ignore errors if they exist)
  try {
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS telegram_link_tokens_user_id_idx ON telegram_link_tokens(user_id)`;
  } catch { /* index may exist */ }
  try {
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS telegram_link_tokens_expires_at_idx ON telegram_link_tokens(expires_at)`;
  } catch { /* index may exist */ }
}

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botUsernameFromEnv = process.env.TELEGRAM_BOT_USERNAME;
  const botUrl = process.env.TELEGRAM_BOT_URL;
  const botUsernameFromUrl = botUrl?.match(/t\.me\/([A-Za-z0-9_]+)/i)?.[1];
  const botUsername = botUsernameFromEnv || botUsernameFromUrl;
  if (!botUsername) {
    return NextResponse.json(
      { error: 'Telegram bot username not configured (set TELEGRAM_BOT_USERNAME or TELEGRAM_BOT_URL)' },
      { status: 500 }
    );
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.user`,
      },
    });
  }

  await ensureTelegramLinkTokensTable();

  console.log('[telegram-link] Running transaction for user:', userId);
  
  try {
    await prisma.$transaction(async (tx) => {
      console.log('[telegram-link] Deleting existing tokens for user...');
      await tx.$executeRaw`DELETE FROM telegram_link_tokens WHERE user_id = ${userId}`;
      console.log('[telegram-link] Inserting new token...');
      await tx.$executeRaw`
        INSERT INTO telegram_link_tokens (token, user_id, expires_at, created_at)
        VALUES (${token}, ${userId}, ${expiresAt}, NOW())
      `;
      console.log('[telegram-link] Token inserted successfully');
    });
  } catch (err) {
    console.error('[telegram-link] Transaction error:', err);
    throw err;
  }

  const link = `https://t.me/${botUsername}?start=${encodeURIComponent(token)}`;
  return NextResponse.json({
    link,
    token,
    expiresAt: expiresAt.toISOString(),
  });
}

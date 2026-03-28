import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendMessage } from '@/lib/telegram';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

async function ensureTelegramLinkTokensTable() {
  console.log('[telegram-webhook] Ensuring telegram_link_tokens table exists...');
  
  // Check if table already exists first
  const tableExists = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'telegram_link_tokens'
    ) AS exists
  `;
  
  if (tableExists && (tableExists as any)[0]?.exists) {
    console.log('[telegram-webhook] Table already exists');
    return;
  }
  
  console.log('[telegram-webhook] Table does not exist, creating...');
  try {
    await prisma.$executeRaw`
      CREATE TABLE telegram_link_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP(3) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[telegram-webhook] Table created');
  } catch (err) {
    console.error('[telegram-webhook] Error:', err);
    throw err;
  }
  
  try {
    await prisma.$executeRaw`CREATE INDEX telegram_link_tokens_user_id_idx ON telegram_link_tokens(user_id)`;
  } catch { /* index may exist */ }
  try {
    await prisma.$executeRaw`CREATE INDEX telegram_link_tokens_expires_at_idx ON telegram_link_tokens(expires_at)`;
  } catch { /* index may exist */ }
}

export async function POST(request: NextRequest) {
  if (WEBHOOK_SECRET) {
    const headerPayload = await headers();
    const secretToken = headerPayload.get('X-Telegram-Bot-Api-Secret-Token');

    if (secretToken !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const data = await request.json();

    if (!data.message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(data.message.chat.id);
    const text = String(data.message.text || '').trim();
    const username = data.message.chat.username || 'User';

    const startMatch = text.match(/^\/start(?:\s+(\S+))?$/i);
    if (startMatch) {
      await ensureTelegramLinkTokensTable();
      const token = startMatch[1];

      if (token) {
        const rows = await prisma.$queryRaw<Array<{ token: string; user_id: string; expires_at: Date }>>`
          SELECT token, user_id, expires_at
          FROM telegram_link_tokens
          WHERE token = ${token}
          LIMIT 1
        `;
        const record = rows[0];

        if (!record || new Date(record.expires_at).getTime() < Date.now()) {
          if (record) {
            await prisma.$executeRaw`DELETE FROM telegram_link_tokens WHERE token = ${record.token}`;
          }
          await sendMessage(
            chatId,
            'Link expired or invalid. Go back to your dashboard and generate a fresh Telegram connect link.'
          );
          return NextResponse.json({ ok: true });
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: record.user_id },
            data: { telegramChatId: chatId },
          }),
          prisma.$executeRaw`DELETE FROM telegram_link_tokens WHERE token = ${record.token}`,
        ]);

        await prisma.$executeRaw`
          DELETE FROM telegram_link_tokens
          WHERE user_id = ${record.user_id}
        `;

        await sendMessage(
          chatId,
          'Connected. You will now receive your alerts here.'
        );
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        `Welcome ${username}.\n\nOpen your dashboard and tap Connect Telegram. It will open this chat with a secure one-time link token.`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/help') {
      await sendMessage(
        chatId,
        'Commands:\n/start <token> - Link this chat using a one-time dashboard link\n/help - Show help'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false });
  }
}

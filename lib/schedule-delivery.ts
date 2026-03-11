import { prisma } from '@/lib/db';
import { sendMessage } from '@/lib/telegram';

type ScheduleWithRelations = Awaited<ReturnType<typeof getScheduleById>>;

type PriceItem =
  | {
      symbol: string;
      name: string;
      price: number;
      changePct: number;
      currency: string;
      ok: true;
    }
  | {
      symbol: string;
      name: string;
      ok: false;
    };

export interface DeliverScheduleInput {
  scheduleId: string;
  userId: string;
  now?: Date;
}

export interface DeliverScheduleResult {
  sent: boolean;
  formattedMessageType: 'rich';
  pricedCount: number;
  failedCount: number;
  reason?:
    | 'schedule_not_found'
    | 'telegram_not_linked'
    | 'no_assets'
    | 'send_failed';
  messagePreview?: string;
}

async function getScheduleById(scheduleId: string, userId: string) {
  return prisma.schedule.findFirst({
    where: { id: scheduleId, userId },
    include: {
      user: true,
      assets: {
        include: { asset: true },
      },
    },
  });
}

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR':
      return 'Rs';
    case 'USD':
      return '$';
    case 'EUR':
      return 'EUR ';
    case 'JPY':
    case 'CNY':
      return 'YEN ';
    case 'GBP':
      return 'GBP ';
    case 'KRW':
      return 'KRW ';
    case 'RUB':
      return 'RUB ';
    case 'BRL':
      return 'BRL ';
    case 'AUD':
      return 'AUD ';
    case 'CAD':
      return 'CAD ';
    default:
      return '$';
  }
}

async function fetchSymbolQuote(symbol: string) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Quote fetch failed for ${symbol}`);
  }

  const data = await response.json();
  const meta = data?.chart?.result?.[0]?.meta;
  const prevClose = meta?.chartPreviousClose || meta?.previousClose;
  const price = meta?.regularMarketPrice;

  if (!price || !prevClose) {
    throw new Error(`Missing quote fields for ${symbol}`);
  }

  const changePct = ((price - prevClose) / prevClose) * 100;
  return {
    price: Number(price.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    currency: meta?.currency || 'USD',
  };
}

async function fetchSchedulePrices(schedule: NonNullable<ScheduleWithRelations>): Promise<PriceItem[]> {
  const symbols = schedule.assets.map((sa) => ({
    symbol: sa.asset.symbol,
    name: sa.asset.name || sa.asset.symbol,
  }));

  const results: PriceItem[] = [];

  for (const item of symbols) {
    try {
      const quote = await fetchSymbolQuote(item.symbol);
      results.push({
        symbol: item.symbol,
        name: item.name,
        price: quote.price,
        changePct: quote.changePct,
        currency: quote.currency,
        ok: true,
      });
    } catch {
      results.push({
        symbol: item.symbol,
        name: item.name,
        ok: false,
      });
    }
  }

  return results;
}

function formatRichScheduleMessage(
  schedule: NonNullable<ScheduleWithRelations>,
  prices: PriceItem[],
  now: Date
) {
  const timezone = schedule.user?.timezone || 'UTC';
  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let msg = `*${schedule.name}*\n`;
  msg += `${dateStr} | ${timeStr}\n`;
  msg += '--------------------\n\n';

  for (const item of prices) {
    if (!item.ok) {
      msg += `- *${item.name}*\n`;
      msg += `  price unavailable\n\n`;
      continue;
    }

    const trend = item.changePct > 0 ? '+' : item.changePct < 0 ? '-' : '=';
    const prefix = getCurrencySymbol(item.currency);
    msg += `${trend} *${item.name}*\n`;
    msg += `  ${prefix}${item.price} (${item.changePct >= 0 ? '+' : ''}${item.changePct}%)\n\n`;
  }

  msg += '--------------------\n';
  msg += 'Powered by LaughingBuddha';

  return msg;
}

export async function deliverRichScheduleMessage(
  input: DeliverScheduleInput
): Promise<DeliverScheduleResult> {
  const now = input.now ?? new Date();
  const schedule = await getScheduleById(input.scheduleId, input.userId);

  if (!schedule) {
    return {
      sent: false,
      formattedMessageType: 'rich',
      pricedCount: 0,
      failedCount: 0,
      reason: 'schedule_not_found',
    };
  }

  const chatId = schedule.user?.telegramChatId;
  if (!chatId) {
    return {
      sent: false,
      formattedMessageType: 'rich',
      pricedCount: 0,
      failedCount: 0,
      reason: 'telegram_not_linked',
    };
  }

  if (schedule.assets.length === 0) {
    return {
      sent: false,
      formattedMessageType: 'rich',
      pricedCount: 0,
      failedCount: 0,
      reason: 'no_assets',
    };
  }

  const prices = await fetchSchedulePrices(schedule);
  const message = formatRichScheduleMessage(schedule, prices, now);
  const pricedCount = prices.filter((p) => p.ok).length;
  const failedCount = prices.length - pricedCount;

  try {
    await sendMessage(chatId, message);
    return {
      sent: true,
      formattedMessageType: 'rich',
      pricedCount,
      failedCount,
      messagePreview: message.slice(0, 240),
    };
  } catch {
    return {
      sent: false,
      formattedMessageType: 'rich',
      pricedCount,
      failedCount,
      reason: 'send_failed',
      messagePreview: message.slice(0, 240),
    };
  }
}

# 🚨 Critical Fixes — LaughingBuddha Audit Response

This document addresses all P0 and P1 issues from the code audit.

---

## P0 FIX 1: `auth()` Must Be Awaited

### Problem
`auth()` in Next.js App Router is async. Using it synchronously causes silent auth bypasses.

### Fix for ALL API Routes

```typescript
// ❌ WRONG — Current code
import { auth } from '@clerk/nextjs';
const { userId } = auth();

// ✅ CORRECT — Fixed
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
```

### Updated Route Handler Pattern

```typescript
// app/api/schedules/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth(); // ✅ await
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of handler
}

export async function POST(request: NextRequest) {
  const { userId } = await auth(); // ✅ await
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of handler
}
```

---

## P0 FIX 2: TOCTOU Race Condition in Schedule Update

### Problem
Three separate DB calls with no transaction. Partial state if anything fails.

### Fix: Use `$transaction` + Combine Ownership Check

```typescript
// app/api/schedules/[id]/route.ts

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for validation
const updateScheduleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  daysOfWeek: z.array(z.number().int().min(1).max(7)).min(1).optional(),
  isActive: z.boolean().optional(),
  assetIds: z.array(z.string().cuid()).min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Validate body
  const body = await request.json();
  const parsed = updateScheduleSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  
  const { name, targetTime, daysOfWeek, isActive, assetIds } = parsed.data;
  
  try {
    // ✅ Use transaction — all or nothing
    const schedule = await prisma.$transaction(async (tx) => {
      // If updating assets, delete existing links first
      if (assetIds !== undefined) {
        await tx.scheduleAsset.deleteMany({
          where: { scheduleId: params.id }
        });
      }
      
      // ✅ Ownership check IN the update query — one atomic operation
      const updated = await tx.schedule.update({
        where: { 
          id: params.id,
          userId // ✅ Combined ownership check
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
    // ✅ Handle "Record not found" (ownership mismatch or doesn't exist)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // ✅ Single delete with ownership check
    await prisma.schedule.delete({
      where: { 
        id: params.id,
        userId // ✅ Ownership enforced in query
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
```

---

## P0 FIX 3: Timezone Query Implementation

### Problem
The scheduler has no actual timezone query logic. This is the core of the product.

### Fix: Correct PostgreSQL Query in Python Scheduler

```python
# scripts/scheduler.py

def get_due_schedules(conn) -> List[Dict[str, Any]]:
    """
    Query database for schedules that are due to be sent.
    
    Uses PostgreSQL timezone conversion to check user's local time.
    """
    cursor = conn.cursor()
    
    # ✅ Query that handles timezone conversion in PostgreSQL
    query = """
    WITH user_schedules AS (
        SELECT 
            s.id as schedule_id,
            s.user_id,
            s.name as schedule_name,
            s.target_time,
            s.days_of_week,
            s.last_sent_date,
            u.telegram_chat_id,
            u.timezone,
            -- Convert UTC to user's local time
            (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone) as local_time,
            -- Get day of week in user's timezone (1=Monday, 7=Sunday)
            EXTRACT(ISODOW FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone))::int as local_dow,
            -- Get date in user's timezone as string
            TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone, 'YYYY-MM-DD') as local_date,
            -- Get current time in user's timezone as string
            TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone, 'HH24:MI') as local_time_str
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE s.is_active = true
          AND u.telegram_chat_id IS NOT NULL
          AND u.telegram_chat_id != ''
    )
    SELECT 
        schedule_id,
        user_id,
        schedule_name,
        target_time,
        telegram_chat_id,
        timezone,
        local_date
    FROM user_schedules
    WHERE 
        -- Check if today is in days_of_week
        local_dow = ANY(days_of_week)
        -- Check if we haven't sent it today already
        AND (last_sent_date IS NULL OR last_sent_date != local_date)
        -- Check if current local time is within 30 min window after target_time
        AND local_time_str >= target_time
        AND local_time_str < (
            (target_time::time + INTERVAL '30 minutes')::time
        )::text;
    """
    
    cursor.execute(query)
    schedules = cursor.fetchall()
    cursor.close()
    
    return schedules
```

---

## P0 FIX 4: Idempotency Guard in Scheduler

### Problem
GitHub Actions cron is not exactly-once. Duplicate messages possible.

### Fix: Atomic "Mark as Sent" with Idempotency Check

```python
# scripts/scheduler.py

def mark_schedule_sent(conn, schedule_id: str, local_date: str) -> bool:
    """
    Atomically mark schedule as sent for today.
    Returns True if successfully marked, False if already sent (idempotency).
    """
    cursor = conn.cursor()
    
    # ✅ Use UPDATE with WHERE to ensure idempotency
    # Only updates if last_sent_date is NULL or different from today
    query = """
    UPDATE schedules 
    SET last_sent_at = CURRENT_TIMESTAMP,
        last_sent_date = %s,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = %s
      AND (last_sent_date IS NULL OR last_sent_date != %s)
    RETURNING id;
    """
    
    cursor.execute(query, (local_date, schedule_id, local_date))
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    
    # ✅ Returns True only if we actually updated (weren't already sent)
    return result is not None

# In the main processing loop:
def process_schedules():
    # ... get due schedules ...
    
    for schedule in schedules:
        schedule_id = schedule['schedule_id']
        local_date = str(schedule['local_date'])
        
        # ✅ Double-check idempotency before sending
        if not mark_schedule_sent(conn, schedule_id, local_date):
            print(f"⏭️ Schedule {schedule_id} already sent today, skipping")
            continue
        
        # Now fetch prices and send
        # ...
```

---

## P1 FIX 1: Zod Validation on All Routes

### Install Zod
```bash
npm install zod
```

### Create Validation Schemas

```typescript
// lib/validations.ts
import { z } from 'zod';

export const createScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  targetTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  daysOfWeek: z.array(
    z.number().int().min(1).max(7)
  ).min(1, 'Select at least one day'),
  assetIds: z.array(
    z.string().cuid()
  ).min(1, 'Select at least one asset'),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const updateUserSchema = z.object({
  telegramChatId: z.string().optional(),
  timezone: z.string().optional(),
});

export const createAssetSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  assetType: z.enum(['STOCK', 'CRYPTO', 'COMMODITY']),
  exchange: z.string().min(1),
});
```

### Use in Routes

```typescript
// Example: POST /api/schedules
import { createScheduleSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await request.json();
  const parsed = createScheduleSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  
  const { name, targetTime, daysOfWeek, assetIds } = parsed.data;
  // ... create schedule
}
```

---

## P1 FIX 2: Clerk Webhook for User Creation

### Problem
User creation in GET endpoint is wrong — GET must be idempotent, and email is empty.

### Fix: Create Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // ✅ Verify webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }
  
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  }
  
  const payload = await request.json();
  const body = JSON.stringify(payload);
  
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt: WebhookEvent;
  
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const eventType = evt.type;
  
  // ✅ Handle user creation
  if (eventType === 'user.created') {
    const { id, email_addresses, primary_email_address_id } = evt.data;
    
    // Get primary email
    const primaryEmail = email_addresses?.find(
      email => email.id === primary_email_address_id
    )?.email_address;
    
    try {
      await prisma.user.upsert({
        where: { id },
        update: {
          email: primaryEmail || '',
          updatedAt: new Date(),
        },
        create: {
          id,
          email: primaryEmail || '',
          timezone: 'Asia/Kolkata', // Default timezone
        },
      });
      
      console.log(`✅ User ${id} created/updated`);
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  }
  
  // ✅ Handle user deletion
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      await prisma.user.delete({
        where: { id }
      });
      
      console.log(`✅ User ${id} deleted`);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
  
  return NextResponse.json({ success: true });
}
```

### Environment Variables

```bash
# Add to .env.local and Vercel
CLERK_WEBHOOK_SECRET=whsec_...
```

Get from: Clerk Dashboard → Webhooks → Add Endpoint → Signing Secret

### Updated GET /api/users (No User Creation)

```typescript
// app/api/users/route.ts
export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ✅ Just fetch — no creation. User should exist from webhook.
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    // User might not be synced yet — return 404, don't create
    return NextResponse.json(
      { error: 'User not found. Please try again in a moment.' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}
```

---

## P1 FIX 3: Type-Safe updateData

```typescript
// Instead of: const updateData: any = {}

// Use proper typing:
type ScheduleUpdateInput = {
  name?: string;
  targetTime?: string;
  daysOfWeek?: number[];
  isActive?: boolean;
};

const updateData: ScheduleUpdateInput = {};
if (name !== undefined) updateData.name = name;
if (targetTime !== undefined) updateData.targetTime = targetTime;
if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek;
if (isActive !== undefined) updateData.isActive = isActive;
```

---

## P2 FIX: Telegram Webhook Secret Validation

```typescript
// app/api/telegram/webhook/route.ts
import { headers } from 'next/headers';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // ✅ Validate secret token
  if (WEBHOOK_SECRET) {
    const headerPayload = headers();
    const secretToken = headerPayload.get('X-Telegram-Bot-Api-Secret-Token');
    
    if (secretToken !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // ... rest of handler
}
```

Set webhook with secret:
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram/webhook",
    "secret_token": "your-random-secret-here"
  }'
```

---

## P2 FIX: Add Database Indexes

```prisma
// prisma/schema.prisma

model Schedule {
  id           String   @id @default(cuid())
  userId       String
  name         String
  targetTime   String   // "HH:MM"
  daysOfWeek   Int[]    // PostgreSQL array
  isActive     Boolean  @default(true)
  lastSentAt   DateTime?
  lastSentDate String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  assets       ScheduleAsset[]

  // ✅ Critical indexes for scheduler performance
  @@index([userId])
  @@index([isActive, targetTime])
  @@index([lastSentDate])
  @@map("schedules")
}
```

---

## Updated Dependencies

```bash
# Add required packages
npm install zod svix

# For Python scheduler
pip install psycopg2-binary yfinance requests pytz
```

---

## Environment Variables Summary

```bash
# Required in .env.local (Vercel)
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
TELEGRAM_WEBHOOK_SECRET=your-random-secret

# Required in GitHub Secrets
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
```

---

## Verification Checklist

- [ ] All API routes use `await auth()`
- [ ] All POST/PATCH bodies validated with Zod
- [ ] Schedule updates use `prisma.$transaction`
- [ ] Ownership checks in WHERE clause, not separate queries
- [ ] Clerk webhook handler created and tested
- [ ] Python scheduler has correct timezone query
- [ ] Idempotency guard in scheduler works
- [ ] Database indexes added to schema
- [ ] Telegram webhook validates secret token
- [ ] `updateData` properly typed everywhere

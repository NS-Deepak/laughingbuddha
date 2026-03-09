# 🚀 LaughingBuddha Implementation Guide

Complete step-by-step guide to implement the multi-user scheduled alert system.

---

## ✅ Completed So Far

1. ✅ Analyzed existing single-user architecture
2. ✅ Designed Neon PostgreSQL database schema
3. ✅ Updated Prisma schema with User, Asset, Schedule, and ScheduleAsset models
4. ✅ Created `scripts/scheduler.py` - GitHub Actions script to query DB and send alerts

---

## 📋 Remaining Implementation Steps

### Step 4: Create Database Migration

After updating `prisma/schema.prisma`, run the migration:

```bash
# Install dependencies if needed
npm install

# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_schedules

# Deploy to production (Neon)
npx prisma migrate deploy
```

**Migration will create:**
- New `timezone` column in `users` table
- New `schedules` table
- New `schedule_assets` junction table

---

### Step 5: Update GitHub Actions Workflow

Replace `.github/workflows/main.yml` with the new multi-user scheduler:

```yaml
name: 🔔 Alert Scheduler

on:
  schedule:
    # Run every 30 minutes
    - cron: '0,30 * * * *'
  
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Dry run (log only, no messages sent)'
        required: false
        default: 'false'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  process-alerts:
    name: 🚀 Process Scheduled Alerts
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🐍 Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: 📦 Install dependencies
        run: |
          pip install --upgrade pip
          pip install psycopg2-binary yfinance requests pytz

      - name: 🤖 Run Scheduler
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          DRY_RUN: ${{ github.event.inputs.dry_run }}
        run: python scripts/scheduler.py

      - name: ✅ Success Summary
        if: success()
        run: |
          echo "## ✅ Alert Scheduler Completed" >> $GITHUB_STEP_SUMMARY
          echo "**Time:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> $GITHUB_STEP_SUMMARY
          echo "**Trigger:** ${{ github.event_name }}" >> $GITHUB_STEP_SUMMARY

      - name: ❌ Failure Summary
        if: failure()
        run: |
          echo "## ❌ Scheduler Failed" >> $GITHUB_STEP_SUMMARY
          echo "**Time:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> $GITHUB_STEP_SUMMARY
          echo "Check logs above for error details." >> $GITHUB_STEP_SUMMARY
```

---

### Step 6: Create Vercel API Routes

#### 6.1 Create `/app/api/schedules/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/db';

// GET: Fetch user's schedules
export async function GET(request: NextRequest) {
  const { userId } = auth();
  
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
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, targetTime, daysOfWeek, assetIds } = body;
    
    // Validate required fields
    if (!name || !targetTime || !daysOfWeek || !assetIds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create schedule with linked assets
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        name,
        targetTime,
        daysOfWeek,
        assets: {
          create: assetIds.map((assetId: string) => ({
            asset: { connect: { id: assetId } }
          }))
        }
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
```

#### 6.2 Create `/app/api/schedules/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/db';

// PATCH: Update schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, targetTime, daysOfWeek, isActive, assetIds } = body;
    
    // Verify schedule belongs to user
    const existing = await prisma.schedule.findFirst({
      where: { id: params.id, userId }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Update schedule
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (targetTime !== undefined) updateData.targetTime = targetTime;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Handle asset updates
    if (assetIds !== undefined) {
      // Delete existing links
      await prisma.scheduleAsset.deleteMany({
        where: { scheduleId: params.id }
      });
      
      // Create new links
      updateData.assets = {
        create: assetIds.map((assetId: string) => ({
          asset: { connect: { id: assetId } }
        }))
      };
    }
    
    const schedule = await prisma.schedule.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assets: {
          include: { asset: true }
        }
      }
    });
    
    return NextResponse.json(schedule);
  } catch (error) {
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
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Verify ownership
    const existing = await prisma.schedule.findFirst({
      where: { id: params.id, userId }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    await prisma.schedule.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
```

#### 6.3 Update `/app/api/users/route.ts` (or create if not exists)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/db';

// GET: Get current user with preferences
export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: '', // Will be populated by Clerk webhook
          timezone: 'Asia/Kolkata'
        }
      });
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
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { telegramChatId, timezone } = body;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(telegramChatId !== undefined && { telegramChatId }),
        ...(timezone !== undefined && { timezone })
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
```

---

### Step 7: Update Telegram Webhook

Update `/app/api/telegram/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    })
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (data.message) {
      const chatId = String(data.message.chat.id);
      const text = data.message.text || '';
      const username = data.message.chat.username || 'User';
      
      if (text.trim() === '/start') {
        const welcomeMsg = `
🕉️ *Welcome to LaughingBuddha, ${username}!*

Your Chat ID is: \`${chatId}\`

🔗 To link your account:
1. Go to the website dashboard
2. Paste this Chat ID in the Telegram settings
3. Create your first alert schedule!

📊 You'll receive personalized stock alerts based on your settings.
        `.trim();
        
        await sendMessage(chatId, welcomeMsg);
      }
      
      if (text.trim() === '/help') {
        const helpMsg = `
🕉️ *LaughingBuddha Help*

*/start* - Get your Chat ID
*/help* - Show this message

📊 Create alert schedules on the website to receive personalized updates.
        `.trim();
        
        await sendMessage(chatId, helpMsg);
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false });
  }
}
```

---

### Step 8: Build Frontend UI

#### 8.1 Create Schedule Form Component

Create `/components/schedules/schedule-form.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Asset {
  id: string;
  symbol: string;
  name: string;
}

interface ScheduleFormProps {
  assets: Asset[];
  onSubmit: (data: {
    name: string;
    targetTime: string;
    daysOfWeek: number[];
    assetIds: string[];
  }) => void;
  onCancel: () => void;
}

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 7, label: 'Sun' },
];

export function ScheduleForm({ assets, onSubmit, onCancel }: ScheduleFormProps) {
  const [name, setName] = useState('');
  const [targetTime, setTargetTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      targetTime,
      daysOfWeek: selectedDays,
      assetIds: selectedAssets,
    });
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Schedule Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Market Update"
          required
        />
      </div>

      <div>
        <Label htmlFor="time">Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})</Label>
        <Input
          id="time"
          type="time"
          value={targetTime}
          onChange={(e) => setTargetTime(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Days of Week</Label>
        <div className="flex gap-2 mt-2">
          {DAYS.map((day) => (
            <label
              key={day.id}
              className={`flex items-center justify-center w-10 h-10 rounded cursor-pointer transition-colors ${
                selectedDays.includes(day.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedDays.includes(day.id)}
                onChange={() => toggleDay(day.id)}
              />
              <span className="text-sm font-medium">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Assets to Track</Label>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
          {assets.map((asset) => (
            <label
              key={asset.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
            >
              <Checkbox
                checked={selectedAssets.includes(asset.id)}
                onCheckedChange={(checked) => {
                  setSelectedAssets(prev =>
                    checked
                      ? [...prev, asset.id]
                      : prev.filter(id => id !== asset.id)
                  );
                }}
              />
              <span className="text-sm">
                {asset.name} ({asset.symbol})
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Create Schedule
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

#### 8.2 Create Telegram Link Component

Create `/components/telegram/telegram-link.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TelegramLinkProps {
  currentChatId?: string | null;
  onSave: (chatId: string) => void;
}

export function TelegramLink({ currentChatId, onSave }: TelegramLinkProps) {
  const [chatId, setChatId] = useState(currentChatId || '');
  const [isEditing, setIsEditing] = useState(!currentChatId);

  const botUrl = `https://t.me/YourBotUsername`; // Replace with your bot URL

  const handleSave = () => {
    onSave(chatId);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔗 Link Telegram</CardTitle>
        <CardDescription>
          Connect your Telegram to receive alert notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing && currentChatId ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Connected Chat ID</p>
              <p className="font-mono text-sm">{currentChatId}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Change
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-2">How to get your Chat ID:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the button below to open Telegram</li>
                <li>Send <code>/start</code> to the bot</li>
                <li>Copy the Chat ID from the response</li>
                <li>Paste it here</li>
              </ol>
            </div>

            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="secondary">
                Open Telegram Bot
              </Button>
            </a>

            <div>
              <Label htmlFor="chatId">Your Chat ID</Label>
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g., 123456789"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!chatId}>
                Save Chat ID
              </Button>
              {currentChatId && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Step 9: Environment Variables

Create `.env.local` for local development:

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: For Telegram webhook
WEBHOOK_URL="https://your-app.vercel.app/api/telegram/webhook"
```

**Set these in Vercel Dashboard:**
- Project Settings → Environment Variables

**Set these in GitHub Secrets:**
- Settings → Secrets and variables → Actions
  - `DATABASE_URL`
  - `TELEGRAM_BOT_TOKEN`

---

### Step 10: Testing Checklist

- [ ] Run `npx prisma migrate dev` successfully
- [ ] Test Telegram `/start` command returns Chat ID
- [ ] Test user can save Chat ID on website
- [ ] Test creating a schedule with assets
- [ ] Test schedule appears in database
- [ ] Run GitHub Actions manually and check logs
- [ ] Verify Telegram message received at scheduled time
- [ ] Test updating schedule (change time/assets)
- [ ] Test deleting schedule

---

### Step 11: Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add multi-user scheduled alerts"
   git push
   ```

2. **Deploy to Vercel**
   - Vercel will auto-deploy from main branch
   - Add environment variables in dashboard

3. **Set Telegram Webhook**
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/api/telegram/webhook"}'
   ```

4. **Verify GitHub Actions**
   - Check Actions tab for successful runs
   - Verify secrets are set correctly

---

## 📊 Data Flow Summary

```
User Journey:
1. Signs up (Clerk auth)
2. Links Telegram (gets Chat ID)
3. Creates schedule (time + assets + days)
4. Data saved to Neon

GitHub Actions (every 30 min):
1. Query: Which schedules are due now?
2. For each due schedule:
   - Fetch asset prices from Yahoo
   - Format message
   - Send via Telegram API
   - Update last_sent_date
```

---

## 💡 Next Features (Future)

- **Price Alerts:** Notify when asset crosses threshold
- **Portfolio Tracking:** Track actual holdings
- **Multiple Channels:** WhatsApp, Email support
- **Premium Tiers:** More schedules, faster updates

---

*Ready to implement! Switch to Code mode to start coding.* 🚀

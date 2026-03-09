# 🚀 LaughingBuddha Implementation Roadmap

## Status: Architecture Complete ✅ | Ready for Code Mode

---

## 📚 Documentation Structure

| Document | Purpose |
|----------|---------|
| [`ARCHITECTURE.md`](../ARCHITECTURE.md) | High-level system overview |
| [`plans/multi-user-architecture.md`](multi-user-architecture.md) | Detailed design with diagrams |
| [`plans/implementation-guide.md`](implementation-guide.md) | Step-by-step implementation steps |
| [`plans/critical-fixes.md`](critical-fixes.md) | **P0/P1 bug fixes from audit** |
| This file | Executive summary & next steps |

---

## ✅ Completed in Architect Mode

### 1. Database Design
- **Prisma Schema** updated with:
  - `User` model (with timezone field)
  - `Schedule` model (time-based alerts)
  - `ScheduleAsset` junction table
  - `Asset` model updated
  - **Critical indexes** added for scheduler performance

### 2. Python Scheduler Script
- **Location:** `scripts/scheduler.py`
- Connects to Neon PostgreSQL
- **Correct timezone query** using PostgreSQL `AT TIME ZONE`
- **Idempotency guard** to prevent duplicate sends
- Fetches prices from Yahoo Finance
- Sends formatted Telegram messages

### 3. Critical Bug Fixes Documented
All issues from code audit addressed in [`plans/critical-fixes.md`](critical-fixes.md):

| Priority | Issue | Status |
|----------|-------|--------|
| P0 | `auth()` must be awaited | ✅ Documented fix |
| P0 | TOCTOU race condition | ✅ `$transaction` pattern |
| P0 | Timezone query logic | ✅ SQL query provided |
| P0 | Scheduler idempotency | ✅ `mark_schedule_sent` fix |
| P1 | Zod validation | ✅ Schemas defined |
| P1 | Clerk webhook handler | ✅ Full implementation |
| P1 | User creation in GET | ✅ Moved to webhook |
| P2 | Database indexes | ✅ Added to schema |
| P2 | Telegram webhook secret | ✅ Validation code |

---

## 🛠️ Remaining Implementation (Code Mode)

### Phase 1: Dependencies & Migration (1 hour)

```bash
# 1. Install dependencies
npm install zod svix

# 2. Generate Prisma client
npx prisma generate

# 3. Create migration
npx prisma migrate dev --name add_schedules

# 4. Verify tables created
npx prisma studio
```

### Phase 2: API Routes (2-3 hours)

Create these files with code from `critical-fixes.md`:

1. **`app/api/webhooks/clerk/route.ts`** (NEW)
   - Handles `user.created` and `user.deleted`
   - Creates user in Neon with real email
   - Validates webhook signature

2. **`app/api/schedules/route.ts`** (UPDATE)
   - GET: List user's schedules
   - POST: Create new schedule
   - **Fix:** `await auth()`, Zod validation

3. **`app/api/schedules/[id]/route.ts`** (UPDATE)
   - PATCH: Update schedule
   - DELETE: Delete schedule
   - **Fix:** `$transaction`, ownership in WHERE clause

4. **`app/api/users/route.ts`** (UPDATE)
   - GET: Get user (no auto-creation)
   - PATCH: Update telegramChatId, timezone
   - **Fix:** `await auth()`

5. **`app/api/telegram/webhook/route.ts`** (UPDATE)
   - POST: Handle `/start` command
   - **Fix:** Secret token validation

### Phase 3: Frontend Components (2-3 hours)

Create from `implementation-guide.md`:

1. **`components/schedules/schedule-form.tsx`**
   - Time picker
   - Day selector (Mon-Sun)
   - Asset multi-select
   - Zod validation

2. **`components/telegram/telegram-link.tsx`**
   - Chat ID input
   - "Open Telegram" button
   - Link/unlink flow

3. **`app/dashboard/page.tsx`** (UPDATE)
   - Display user's schedules
   - Add "New Schedule" button
   - Show Telegram link status

### Phase 4: Environment Setup (30 min)

**Vercel Environment Variables:**
```
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
TELEGRAM_WEBHOOK_SECRET=random-secret-here
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername
```

**GitHub Secrets:**
```
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
```

**Clerk Dashboard:**
1. Add webhook endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
2. Select events: `user.created`, `user.deleted`
3. Copy signing secret → `CLERK_WEBHOOK_SECRET`

**Set Telegram Webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram/webhook",
    "secret_token": "random-secret-here"
  }'
```

### Phase 5: Testing (1-2 hours)

**Test Checklist:**
- [ ] Create user → Check Neon DB
- [ ] Send `/start` to Telegram bot → Get Chat ID
- [ ] Link Telegram on website
- [ ] Create schedule with assets
- [ ] Run GitHub Actions manually
- [ ] Verify Telegram message received
- [ ] Test duplicate prevention (run scheduler twice)
- [ ] Test unauthorized access (try to access another user's schedule)
- [ ] Test validation errors (invalid time format, etc.)

---

## 🚨 Critical Implementation Notes

### 1. `auth()` is Async
```typescript
// WRONG
const { userId } = auth();

// CORRECT
const { userId } = await auth();
```

### 2. Use `$transaction` for Updates
```typescript
await prisma.$transaction(async (tx) => {
  await tx.scheduleAsset.deleteMany({ where: { scheduleId: id } });
  return tx.schedule.update({
    where: { id, userId }, // ownership check here
    data: updateData
  });
});
```

### 3. Validate with Zod
```typescript
const parsed = createScheduleSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.flatten() },
    { status: 400 }
  );
}
```

### 4. User Creation in Webhook, Not GET
```typescript
// WRONG: Creating user in GET endpoint

// CORRECT: Webhook handler
if (eventType === 'user.created') {
  await prisma.user.create({ data: { id, email } });
}
```

---

## 📁 Key Files to Create/Modify

### New Files
```
app/api/webhooks/clerk/route.ts      # Clerk webhook handler
lib/validations.ts                    # Zod schemas
```

### Modified Files
```
prisma/schema.prisma                  # Schema updated ✅
scripts/scheduler.py                  # Scheduler script ✅
.github/workflows/main.yml           # Workflow updated ✅
app/api/schedules/route.ts           # Need to implement
app/api/schedules/[id]/route.ts      # Need to implement
app/api/users/route.ts               # Need to implement
app/api/telegram/webhook/route.ts    # Need to implement
```

---

## 🎯 Success Criteria

The implementation is complete when:

1. ✅ User can sign up and be auto-created in Neon
2. ✅ User can get Chat ID from Telegram bot via `/start`
3. ✅ User can link Telegram on website
4. ✅ User can create multiple schedules with different times/assets
5. ✅ GitHub Actions runs every 30 minutes
6. ✅ Users receive Telegram messages at their scheduled times
7. ✅ No duplicate messages (idempotency works)
8. ✅ Users can only access their own data

---

## 🆘 Need Help?

### Reference Code
All code snippets are in:
- [`plans/critical-fixes.md`](critical-fixes.md) — P0/P1 fixes
- [`plans/implementation-guide.md`](implementation-guide.md) — Full components

### Common Issues
1. **Database connection fails** → Check `DATABASE_URL` format
2. **Auth not working** → Ensure `await auth()` everywhere
3. **Telegram messages not sending** → Check `TELEGRAM_BOT_TOKEN`
4. **Scheduler not finding alerts** → Check timezone query in `scheduler.py`

---

## 🚀 Ready to Switch to Code Mode

All architecture decisions are made. All critical bugs are documented with fixes. All code snippets are provided.

**Next step:** Switch to Code mode and implement Phase 1 (Dependencies & Migration).

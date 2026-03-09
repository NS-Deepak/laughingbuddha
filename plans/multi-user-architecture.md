# 🕉️ LaughingBuddha Multi-User Architecture (Neon + GitHub Actions)

## System Overview

A SaaS-style stock alert platform where multiple users can customize their own asset lists and receive personalized Telegram alerts based on their local timezone.

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TB
    subgraph User["👤 User"]
        Browser[Web Browser]
        TelegramApp[Telegram App]
    end
    
    subgraph Vercel["▲ Vercel (Frontend + API)"]
        NextApp[Next.js App]
        Dashboard[Dashboard UI]
        APIRoutes[Vercel API Routes]
    end
    
    subgraph NeonDB["🐘 Neon PostgreSQL"]
        UsersTable[(users)]
        AlertsTable[(alerts)]
    end
    
    subgraph GitHub["🔧 GitHub Actions"]
        Scheduler[Scheduler Script<br/>Runs every 30 min]
    end
    
    subgraph External["🌐 External APIs"]
        Yahoo[Yahoo Finance API]
        Telegram[Telegram Bot API]
    end
    
    Browser -->|1. Configure alerts| NextApp
    NextApp -->|2. Save preferences| APIRoutes
    APIRoutes -->|3. Store data| NeonDB
    
    GitHub -->|4. Query due alerts| NeonDB
    GitHub -->|5. Fetch prices| Yahoo
    GitHub -->|6. Send messages| Telegram
    Telegram -->|7. Deliver| TelegramApp
```

---

## 📊 Database Schema (Prisma)

### Model: User
```prisma
model User {
  id          String   @id @default(uuid())
  telegramId  String   @unique  // Telegram Chat ID
  name        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  alerts      Alert[]
}
```

### Model: Alert
```prisma
model Alert {
  id            String   @id @default(uuid())
  userId        String
  
  // Assets to track (stored as JSON array)
  assets        String   // e.g., '["AAPL", "BTC-USD", "GC=F"]'
  
  // Schedule
  targetTime    String   // "09:00" (24-hour format)
  timezone      String   // "Asia/Kolkata" (IANA format)
  daysOfWeek    Int[]    // [1,2,3,4,5] for Mon-Fri
  
  // Status
  isActive      Boolean  @default(true)
  lastSentAt    DateTime?
  
  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([isActive, targetTime])
}
```

---

## 🔄 Data Flow

### User Onboarding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Vercel)
    participant T as Telegram Bot
    participant DB as Neon DB
    
    U->>T: Click "Link Telegram" button
    T->>U: Opens Telegram, user sends /start
    T->>U: Replies with Chat ID: 123456789
    U->>F: Enters Chat ID on website
    U->>F: Selects assets & schedule
    F->>DB: Creates user + alert records
    F->>U: Shows success message
```

### Alert Processing Flow (GitHub Actions)

```mermaid
sequenceDiagram
    participant GA as GitHub Actions
    participant DB as Neon DB
    participant YF as Yahoo Finance
    participant TG as Telegram API
    
    loop Every 30 minutes
        GA->>DB: Query: Get active alerts where<br/>current time matches target_time<br/>in user's timezone
        DB-->>GA: Return list of due alerts
        
        loop For each alert
            GA->>YF: Fetch prices for assets
            YF-->>GA: Return price data
            GA->>GA: Format message
            GA->>TG: Send to telegramId
            TG-->>GA: Confirm delivery
            GA->>DB: Update lastSentAt
        end
    end
```

---

## 📁 File Structure

```
laughingbuddha/
├── .github/
│   └── workflows/
│       └── scheduler.yml          # GitHub Actions workflow
├── app/
│   ├── api/
│   │   ├── alerts/
│   │   │   └── route.ts           # CRUD for alerts
│   │   ├── users/
│   │   │   └── route.ts           # User management
│   │   └── telegram/
│   │       └── webhook/
│   │           └── route.ts       # Telegram webhook handler
│   ├── dashboard/
│   │   └── page.tsx               # User dashboard
│   └── page.tsx                   # Landing page
├── lib/
│   ├── db.ts                      # Prisma client
│   └── yahoo-finance.ts           # Price fetching utilities
├── prisma/
│   └── schema.prisma              # Database schema
├── scripts/
│   └── scheduler.py               # GitHub Actions script
└── ARCHITECTURE.md
```

---

## 🔐 Environment Variables

### For Vercel (Frontend + API)
```bash
# Database
DATABASE_URL="postgresql://user:pass@neon-host/neondb"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"

# Optional: Webhook URL for Telegram
WEBHOOK_URL="https://your-app.vercel.app/api/telegram/webhook"
```

### For GitHub Actions
Set in: Settings → Secrets and variables → Actions

| Secret Name | Description |
|-------------|-------------|
| `DATABASE_URL` | Neon connection string (same as Vercel) |
| `TELEGRAM_BOT_TOKEN` | Your bot token |

---

## ⏰ GitHub Actions Workflow

### Schedule Strategy
- **Frequency:** Every 30 minutes
- **Why 30 min?** Balances responsiveness with free tier limits
- **Time matching:** Script queries DB for alerts where `target_time` falls within the last 30 minutes

```yaml
name: 🔔 Alert Scheduler

on:
  schedule:
    - cron: '0,30 * * * *'  # Every 30 minutes
  workflow_dispatch:

jobs:
  process-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: pip install psycopg2-binary yfinance requests pytz
      
      - name: Process due alerts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
        run: python scripts/scheduler.py
```

---

## 📱 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Shows welcome message with Chat ID |
| `/help` | Shows available commands |

### /start Response Format
```
🕉️ Welcome to LaughingBuddha!

Your Chat ID is: `123456789`

🔗 Use this ID to link your account on the website.

📊 You'll receive personalized stock alerts based on your settings.
```

---

## 🛠️ Implementation Steps

### Phase 1: Database Setup
1. Create Neon PostgreSQL project
2. Update `prisma/schema.prisma` with User and Alert models
3. Run `npx prisma migrate dev` to create tables
4. Set `DATABASE_URL` in Vercel and GitHub Secrets

### Phase 2: API Routes
1. Create `/api/telegram/webhook` - Handle /start command
2. Create `/api/users` - Create/update users
3. Create `/api/alerts` - CRUD for alerts
4. Create `/api/scheduler/trigger` - Endpoint for GitHub Actions

### Phase 3: Frontend
1. Update landing page with "Link Telegram" CTA
2. Build dashboard with:
   - Asset selector (multi-select)
   - Time picker
   - Timezone dropdown
   - Day selector (Mon-Sun checkboxes)
3. Show linked Telegram status

### Phase 4: GitHub Actions Script
1. Create `scripts/scheduler.py`
2. Query Neon for due alerts
3. Fetch prices from Yahoo Finance
4. Send Telegram messages
5. Update `lastSentAt` timestamps

### Phase 5: Testing
1. Test user onboarding flow
2. Test alert scheduling logic
3. Test timezone conversions
4. Test edge cases (DST changes, etc.)

---

## 🎯 Key Design Decisions

### Why 30-minute intervals?
- Free GitHub Actions limit isn't a concern for public repos
- 30 min provides good balance between responsiveness and efficiency
- Avoids hitting Yahoo Finance rate limits

### Why store assets as JSON string?
- PostgreSQL arrays can be tricky with Prisma
- JSON provides flexibility for future asset metadata
- Easy to parse in Python

### Timezone handling
- Store IANA timezone names (e.g., "Asia/Kolkata")
- Convert to UTC in the scheduler script using `pytz`
- Handle daylight saving time automatically

### Preventing duplicate alerts
- Store `lastSentAt` timestamp
- Only send if `lastSentAt` is null or > 23 hours ago
- Prevents duplicate sends within the same day

---

## 🚀 Deployment Checklist

- [ ] Create Neon project and get connection string
- [ ] Set all environment variables in Vercel
- [ ] Set secrets in GitHub repository
- [ ] Deploy to Vercel
- [ ] Set Telegram webhook URL
- [ ] Test complete user flow
- [ ] Monitor GitHub Actions runs

---

## 💡 Future Enhancements

- **Price Threshold Alerts:** "Alert me when BTC > $100k"
- **Portfolio Tracking:** Track user's actual holdings
- **Multiple Alert Schedules:** Different assets at different times
- **Email Notifications:** Alternative to Telegram
- **Mobile App:** React Native companion app

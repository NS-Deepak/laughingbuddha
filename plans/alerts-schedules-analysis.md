# Alerts vs Schedules - Analysis & Recommendation

## Current State

### Alerts Page (`/dashboard/alerts`)
- **Purpose**: Price threshold alerts (e.g., "Alert me when BTC hits $70,000")
- **Trigger Type**: `PRICE_LIMIT` (price crosses threshold)
- **UI**: Shows active alerts, quota usage, filters by type
- **Database**: `Alert` model

### Schedules Page (`/dashboard/schedules`)
- **Purpose**: Daily/weekly digest updates (e.g., "Send me portfolio update at 9 AM daily")
- **Trigger Type**: Time-based (`targetTime`, `daysOfWeek`)
- **UI**: Create schedules, select assets, "Send Now" button
- **Database**: `Schedule` model

---

## The Problem

### Functionality Overlap
1. Both use the **same Telegram integration** for delivery
2. Both can be **time-based** (Alert has `SCHEDULED` type, Schedule is purely time-based)
3. User confusion: "Why do I have two pages for notifications?"

### Data Model Issues
- `Alert.triggerType = SCHEDULED` is essentially the same as `Schedule`
- Two separate tables doing similar things
- More code to maintain

---

## Implementation Options

| Approach | Summary | Tradeoff | Best When |
|----------|---------|----------|-----------|
| **1. Merge into Unified Notifications** | Single page with "Price Alerts" + "Scheduled Digests" sections | Best UX, slightly more complex UI | Most complete solution |
| **2. Keep Separate, Clarify** | Document difference, add clear labels | Minimal change, confusion remains | When users understand both |
| **3. Remove Alerts, Keep Schedules Only** | Delete alerts, schedules handle all cases | Simpler, lose price triggers | When price alerts aren't critical yet |

---

## Recommended: Option 1 - Unified Notifications Page

**Justification**: 
- Single place for all notification management
- Clear separation: "Price Alerts" (event) vs "Scheduled Digests" (time)
- Matches how exchanges like Binance organize notifications
- Future-proof: can add more alert types easily

### Proposed Structure

```
/dashboard/notifications (or /dashboard/alerts after merge)
├── Price Alerts (PRICE_LIMIT)
│   ├── Asset: BTC-USD
│   ├── Condition: Above $70,000
│   └── Status: Active/Muted
│
├── Scheduled Digests (SCHEDULE)
│   ├── Name: Morning Update
│   ├── Time: 09:00 IST
│   ├── Days: Mon-Fri
│   └── Assets: [GOOG, AAPL, BTC]
```

### Benefits
1. **Unified UX**: One page instead of two
2. **Same Telegram delivery**: Both use same `sendMessage()` 
3. **Shared quota system**: Count toward same monthly limit
4. **Easier maintenance**: One set of APIs, components

### Action Items

1. **Rename `/alerts` to `/notifications`** (or merge into alerts)
2. **Add "Scheduled Digest" section** to alerts page
3. **Move Schedule data** into Alert model with `type: SCHEDULED` 
4. **Remove separate Schedule UI** - reuse Alert components
5. **Delete Schedule API/routes** - use Alert API instead

---

## Immediate Fixes (If Keeping Current)

If you want to **keep both pages** with minimal changes:

1. **Clarify labels**:
   - Alerts page: "Price Alerts" (remove "Time" filter for now)
   - Schedules page: "Daily Digests" 
   
2. **Hide SCHEDULED alerts** - they're not implemented anyway

3. **Add breadcrumb**: "Alerts > Daily Updates" to show relationship

---

## Decision Required

**What should we do?**

1. **Merge into one Notifications page** (recommended)
2. **Keep separate, add documentation**
3. **Remove alerts, keep schedules only**

Let me know preference and I'll implement.

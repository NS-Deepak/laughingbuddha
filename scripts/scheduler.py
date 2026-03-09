#!/usr/bin/env python3
"""
LaughingBuddha Alert Scheduler
Runs every 30 minutes via GitHub Actions
Queries Neon DB for due alerts and sends Telegram notifications
"""

import os
import sys
import json
import psycopg2
import psycopg2.extras
import requests
import yfinance as yf
import pytz
from datetime import datetime, timedelta
from typing import List, Dict, Any

# --- Configuration ---
DATABASE_URL = os.environ.get("DATABASE_URL")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not set")
    sys.exit(1)

if not TELEGRAM_BOT_TOKEN:
    print("❌ Error: TELEGRAM_BOT_TOKEN not set")
    sys.exit(1)

# Time window for checking alerts (in minutes)
# We check for alerts that should have triggered in the last 30 minutes
CHECK_WINDOW_MINUTES = 30


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)


def get_due_schedules(conn) -> List[Dict[str, Any]]:
    """
    Query database for schedules that are due to be sent.
    
    A schedule is due if:
    1. It's active (is_active = true)
    2. Current time in user's timezone matches target_time (within window)
    3. Today is in days_of_week
    4. It hasn't been sent today yet
    """
    cursor = conn.cursor()
    
    # Get current UTC time
    now_utc = datetime.now(pytz.UTC)
    
    query = """
    WITH user_local_times AS (
        SELECT 
            s.id as schedule_id,
            s.user_id,
            s.name as schedule_name,
            s.target_time,
            s.days_of_week,
            s.last_sent_date,
            u.telegram_chat_id,
            u.timezone,
            -- Convert UTC to user's local timezone
            (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone)::time as local_time,
            (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone)::date as local_date,
            EXTRACT(ISODOW FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE u.timezone)) as local_dow
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE s.is_active = true
          AND u.telegram_chat_id IS NOT NULL
    )
    SELECT 
        schedule_id,
        user_id,
        schedule_name,
        target_time,
        telegram_chat_id,
        timezone,
        local_time,
        local_date
    FROM user_local_times
    WHERE 
        -- Check if today is in days_of_week (1=Monday, 7=Sunday)
        local_dow = ANY(days_of_week)
        -- Check if we haven't sent it today
        AND (last_sent_date IS NULL OR last_sent_date != local_date::text)
        -- Check if current local time is within 30 minutes after target_time
        AND local_time >= target_time::time
        AND local_time < (target_time::time + INTERVAL '30 minutes');
    """
    
    cursor.execute(query)
    schedules = cursor.fetchall()
    cursor.close()
    
    return schedules


def get_schedule_assets(conn, schedule_id: str) -> List[Dict[str, Any]]:
    """Get all assets for a specific schedule"""
    cursor = conn.cursor()
    
    query = """
    SELECT a.symbol, a.name, a.asset_type
    FROM schedule_assets sa
    JOIN assets a ON sa.asset_id = a.id
    WHERE sa.schedule_id = %s;
    """
    
    cursor.execute(query, (schedule_id,))
    assets = cursor.fetchall()
    cursor.close()
    
    return assets


def fetch_prices(assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Fetch current prices for assets from Yahoo Finance"""
    prices = {}
    
    for asset in assets:
        symbol = asset['symbol']
        name = asset['name']
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info
            
            price = info.last_price
            change = info.last_price - info.previous_close if info.previous_close else 0
            change_pct = (change / info.previous_close * 100) if info.previous_close else 0
            
            prices[symbol] = {
                'name': name,
                'price': price,
                'change': change,
                'change_pct': change_pct,
                'currency': info.currency or 'USD'
            }
            
        except Exception as e:
            print(f"⚠️ Error fetching {symbol}: {e}")
            prices[symbol] = {
                'name': name,
                'price': None,
                'error': str(e)
            }
    
    return prices


def format_message(schedule_name: str, prices: Dict[str, Any], timezone: str) -> str:
    """Format the Telegram message"""
    # Get current time in the user's timezone
    tz = pytz.timezone(timezone)
    now = datetime.now(tz)
    time_str = now.strftime('%I:%M %p')
    date_str = now.strftime('%d %b %Y')
    
    # Build message
    msg = f"🕉️ *{schedule_name}*\n"
    msg += f"📅 {date_str} | 🕐 {time_str}\n"
    msg += "━" * 20 + "\n\n"
    
    for symbol, data in prices.items():
        name = data.get('name', symbol)
        
        if data.get('price') is None:
            msg += f"⚠️ *{name}*: Error fetching price\n"
            continue
        
        price = data['price']
        change_pct = data.get('change_pct', 0)
        currency = data.get('currency', 'USD')
        
        # Currency symbol
        symbol_prefix = "₹" if currency == "INR" else "$" if currency == "USD" else ""
        
        # Trend emoji
        if change_pct > 0:
            trend = "📈"
        elif change_pct < 0:
            trend = "📉"
        else:
            trend = "➖"
        
        msg += f"{trend} *{name}*\n"
        msg += f"   {symbol_prefix}{price:,.2f} ({change_pct:+.2f}%)\n\n"
    
    msg += "━" * 20 + "\n"
    msg += "💎 Powered by LaughingBuddha"
    
    return msg


def send_telegram_message(chat_id: str, message: str) -> bool:
    """Send message via Telegram Bot API"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        result = response.json()
        
        if result.get("ok"):
            print(f"✅ Message sent to {chat_id}")
            return True
        else:
            print(f"❌ Telegram error: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to send message: {e}")
        return False


def mark_schedule_sent(conn, schedule_id: str, local_date: str) -> bool:
    """
    Atomically mark schedule as sent for today.
    Returns True if successfully marked, False if already sent (idempotency guard).
    """
    cursor = conn.cursor()
    
    # P0 FIX: Idempotency guard - only update if not already sent today
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
    
    # Returns True only if we actually updated (weren't already sent)
    return result is not None


def process_schedules():
    """Main function to process all due schedules"""
    print("🚀 Starting LaughingBuddha Scheduler")
    print(f"⏰ Current UTC time: {datetime.now(pytz.UTC)}")
    print("━" * 50)
    
    try:
        conn = get_db_connection()
        print("✅ Connected to database")
        
        # Get due schedules
        schedules = get_due_schedules(conn)
        print(f"📋 Found {len(schedules)} schedules due")
        
        if not schedules:
            print("👍 No schedules to process")
            return
        
        # Process each schedule
        success_count = 0
        fail_count = 0
        
        for schedule in schedules:
            schedule_id = schedule['schedule_id']
            user_id = schedule['user_id']
            schedule_name = schedule['schedule_name']
            chat_id = schedule['telegram_chat_id']
            timezone = schedule['timezone']
            local_date = str(schedule['local_date'])
            
            print(f"\n📝 Processing: {schedule_name} (User: {user_id[:8]}...)")
            
            # P0 FIX: Idempotency guard - mark as sent BEFORE sending to prevent duplicates
            # If another job is running concurrently, this will return False
            if not mark_schedule_sent(conn, schedule_id, local_date):
                print(f"   ⏭️ Already sent today, skipping (idempotency guard)")
                continue
            
            # Get assets for this schedule
            assets = get_schedule_assets(conn, schedule_id)
            
            if not assets:
                print(f"   ⚠️ No assets found for schedule {schedule_id}")
                continue
            
            print(f"   📊 Fetching prices for {len(assets)} assets...")
            
            # Fetch prices
            prices = fetch_prices(assets)
            
            # Format message
            message = format_message(schedule_name, prices, timezone)
            
            # Send message
            if send_telegram_message(chat_id, message):
                success_count += 1
                print(f"   ✅ Sent successfully")
            else:
                # If send fails, we already marked as sent (to prevent spam)
                # In production, you might want to retry or alert
                fail_count += 1
                print(f"   ❌ Failed to send (but marked as sent to prevent retry spam)")
        
        print("\n" + "━" * 50)
        print(f"📊 Summary: {success_count} sent, {fail_count} failed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()
            print("✅ Database connection closed")


if __name__ == "__main__":
    process_schedules()

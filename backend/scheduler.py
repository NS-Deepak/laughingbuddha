import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import pytz
from prisma import Prisma
from backend.database import db
import requests
import os

scheduler = AsyncIOScheduler()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

async def check_scheduled_alerts():
    print("Checking scheduled alerts...")
    if not db.is_connected():
        await db.connect()

    # Get current time in IST
    ist = pytz.timezone('Asia/Kolkata')
    now = datetime.now(ist)
    current_time_str = now.strftime("%H:%M") # "09:30"

    print(f"Current time (IST): {current_time_str}")

    try:
        # Fetch alerts
        # equivalent to: 
        # where: { isActive: true, triggerType: "SCHEDULED", triggerValue: currentParam }
        alerts = await db.alert.find_many(
            where={
                "isActive": True,
                "triggerType": "SCHEDULED",
                "triggerValue": current_time_str
            },
            include={"user": True}
        )
        
        if not alerts:
            print("No alerts to send.")
            return

        print(f"Found {len(alerts)} alerts.")

        for alert in alerts:
            if not alert.user:
                continue
            
            # Fetch price
            price = await fetch_price(alert.assetSymbol)
            
            if price:
                msg = f"🔔 *{alert.assetSymbol} Update*\n\nCurrent Price: ₹{price}\n\nTime: {current_time_str}"
                
                # Send to Telegram if user has Telegram linked
                if alert.user.telegramChatId:
                    await send_telegram_message(alert.user.telegramChatId, msg)
                
                # TODO: Enable after frontend integration
                # Send to WhatsApp if user has WhatsApp linked
                # if alert.user.whatsappPhone:
                #     await send_whatsapp_message(alert.user.whatsappPhone, msg)
                
                # Update lastSentAt
                await db.alert.update(
                    where={"id": alert.id},
                    data={"lastSentAt": datetime.now(pytz.utc)}
                )
    
    except Exception as e:
        print(f"Error in scheduler: {e}")

async def fetch_price(symbol: str):
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        # fast_info is often faster
        price = ticker.fast_info.last_price
        return round(price, 2) if price else None
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

async def send_telegram_message(chat_id: str, text: str):
    if not TELEGRAM_BOT_TOKEN:
        print("TELEGRAM_BOT_TOKEN not set")
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    try:
        requests.post(url, json=payload)
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")

async def send_whatsapp_message(phone_number: str, text: str):
    """Send WhatsApp alert using Meta Cloud API"""
    try:
        from backend.bot.whatsapp import send_whatsapp_message as send_wa
        await send_wa(phone_number, text)
    except Exception as e:
        print(f"Failed to send WhatsApp message: {e}")

def start_scheduler():
    scheduler.add_job(check_scheduled_alerts, 'cron', second='0') # Run at start of every minute
    scheduler.start()

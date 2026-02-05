import os
import requests
import yfinance as yf
import pytz
from datetime import datetime

# --- CONFIGURATION ---
# We use "Secrets" so your passwords are safe (I will show you where to put them)
BOT_TOKEN = os.environ["8536010247:AAFd0_0OkZxAJx_oHJoPnqremg8DdWz97a4"]
CHAT_ID = os.environ["7164252816"]

# YOUR STOCK LIST (Yahoo Finance Tickers)
# format: "Name You Want To See": "YahooTicker"
STOCKS = {
    "Swiggy": "SWIGGY.NS",
    "Zomato": "ZOMATO.NS",
    "Tata Motors": "TATAMOTORS.NS",
    "SBI Bank": "SBIN.NS",
    "Hero MotoCorp": "HEROMOTOCO.NS",
    "Nykaa": "NYKAA.NS",
    "TCS": "TCS.NS",
    "Groww ETF": "GROWW.NS"  # Assuming Groww Nifty EV ETF or similar
}

def send_update():
    # 1. Get India Time
    ist = pytz.timezone('Asia/Kolkata')
    time_now = datetime.now(ist).strftime('%I:%M %p')
    
    # 2. Build Message
    msg = f"🚀 *Market Update* {time_now})\n"
    msg += "----------------------------\n"

    # 3. Fetch Prices
    for name, ticker in STOCKS.items():
        try:
            stock = yf.Ticker(ticker)
            # 'fast_info' is the fastest way to get live price
            price = stock.fast_info.last_price
            
            if price:
                msg += f"• *{name}*: ₹{round(price, 2)}\n"
            else:
                msg += f"• *{name}*: N/A\n"
        except Exception as e:
            # If a stock fails (like Ather if not listed yet), it skips without crashing
            print(f"Skipping {name}: {e}")
            msg += f"• *{name}*: ⚠️ Not Found\n"

    # 4. Send to Telegram
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID, 
        "text": msg, 
        "parse_mode": "Markdown"
    }
    requests.post(url, json=payload)
    print("✅ Message sent successfully!")

if __name__ == "__main__":
    send_update()
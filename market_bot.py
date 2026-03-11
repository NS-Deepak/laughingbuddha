import os
import requests
import yfinance as yf
import pytz
from datetime import datetime

# --- CONFIGURATION ---
BOT_TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")

# Restructured STOCKS dictionary for better grouping
MARKET_DATA = {
    "🇮🇳 INDIAN STOCKS": {
        "Swiggy": ["SWIGGY.NS", "SWIGGY.BO"],
        "Zomato": ["ZOMATO.NS", "ETERNAL.BO"],
        "Tata Motors": ["TATAMOTORS.NS", "TMCV.BO"],
        "SBI Bank": ["SBIN.NS", "SBIN.BO"],
        "Hero MotoCorp": ["HEROMOTOCO.NS", "HEROMOTOCO.BO"],
        "Nykaa": ["NYKAA.NS", "NYKAA.BO"],
        "TCS": ["TCS.NS", "TCS.BO"],
        "Groww ETF": ["GROWW.NS", "GROWW.BO"],
    },
    "🇺🇸 USA STOCKS": {
        "Tesla": ["TSLA"],
        "Nvidia": ["NVDA"],
        "Apple": ["AAPL"],
        "Amazon": ["AMZN"],
    },
    "📀 COMMODITIES": {
        "Gold (BeES)": ["GOLDBEES.NS"],
        "Silver (BeES)": ["SILVERBEES.NS"],
    },
    "🪙 CRYPTO": {
        "Bitcoin": ["BTC-INR"],
        "Ethereum": ["ETH-INR"],
        "Solana": ["SOL-INR"],
        "Polygon (Matic)": ["MATIC-INR"],
    },
    "🇯🇵 JAPAN STOCKS": {
        "Toyota": ["7203.T"],
        "Sony": ["6758.T"],
    }
}

def get_price(tickers):
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            price = stock.fast_info.last_price
            if price:
                return price
        except Exception:
            continue
    return None

def send_update():
    ist = pytz.timezone('Asia/Kolkata')
    time_now = datetime.now(ist).strftime('%I:%M %p')
    
    msg = f"🚀 Market Update ({time_now})\n"
    msg += "----------------------------\n"

    for category, assets in MARKET_DATA.items():
        # Clean header spacing
        msg += f"\n {category} \n"
        
        for name, ticker_list in assets.items():
            try:
                price = get_price(ticker_list)
                if price:
                    # Clean bullet and price format
                    msg += f"• {name}: ₹{round(price, 2)}\n"
                else:
                    msg += f"• {name}: ⚠️ Error\n"
            except Exception as e:
                msg += f"• {name}: ⚠️ Not Found\n"

    # Sending to Telegram
    if BOT_TOKEN and CHAT_ID:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": CHAT_ID, 
            "text": msg, 
            "parse_mode": "Markdown"
        }
        requests.post(url, json=payload)
        print("✅ Telegram message sent!")
    else:
        print("⚠️ Config Error: BOT_TOKEN or CHAT_ID missing.")

if __name__ == "__main__":
    send_update()

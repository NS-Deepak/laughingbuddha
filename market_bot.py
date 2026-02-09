import os
import requests
import yfinance as yf
import pytz
from datetime import datetime
import urllib.parse

# --- CONFIGURATION ---
# Getting secret from GitHub
# Note: Ensure you have these secrets set in your GitHub Repo settings!
BOT_TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")
# IF YOU ARE USING WHATSAPP, UNCOMMENT THESE INSTEAD:
# PHONE_NUMBER = os.environ["WHATSAPP_PHONE"]
# API_KEY = os.environ["WHATSAPP_KEY"]

# YOUR STOCK LIST
# Format: "Name": ["Option 1", "Option 2"]
# The bot will try Option 1. If it fails, it swaps to Option 2 automatically.
STOCKS = {
    # --- INDIAN STOCKS ---
    "Swiggy": ["SWIGGY.NS", "SWIGGY.BO"],
    "Zomato (Eternal)": ["ZOMATO.NS", "ZOMATO.BO"], # Note: Ticker is likely still ZOMATO on Yahoo
    "Tata Motors": ["TATAMOTORS.BO", "TATAMOTORS.NS"],
    "SBI Bank": ["SBIN.NS", "SBIN.BO"],
    "Hero MotoCorp": ["HEROMOTOCO.NS", "HEROMOTOCO.BO"],
    "Nykaa": ["NYKAA.NS", "NYKAA.BO"],
    "TCS": ["TCS.NS", "TCS.BO"],
    "Groww ETF": ["GROWW.NS", "GROWW.BO"],

    # --- COMMODITIES (ETFs in INR) ---
    "Gold (BeES)": ["GOLDBEES.NS", "GOLDBEES.BO"],
    "Silver (BeES)": ["SILVERBEES.NS", "SILVERBEES.BO"],

    # --- CRYPTO (Live 24/7 in INR) ---
    "Bitcoin": ["BTC-INR"],
    "Ethereum": ["ETH-INR"],
    "Solana": ["SOL-INR"],
    "Polygon (Matic)": ["MATIC-INR"]
}

def get_price(tickers):
    """
    Smart Function: Tries fetching price from the first ticker.
    If it fails, it automatically tries the next one in the list.
    """
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            price = stock.fast_info.last_price
            if price:
                return price
        except Exception:
            continue # If this ticker fails, loop continues to the next one
    return None # If all options fail

def send_update():
    ist = pytz.timezone('Asia/Kolkata')
    time_now = datetime.now(ist).strftime('%I:%M %p')
    
    msg = f"🚀 *Market Update* ({time_now})\n"
    msg += "----------------------------\n"

    for name, ticker_list in STOCKS.items():
        try:
            # HERE IS THE FIX: We pass the whole list to our smart function
            price = get_price(ticker_list)
            
            if price:
                msg += f"• *{name}*: ₹{round(price, 2)}\n"
            else:
                msg += f"• *{name}*: ⚠️ Error\n"
        except Exception as e:
            print(f"Skipping {name}: {e}")
            msg += f"• *{name}*: ⚠️ Not Found\n"

    # --- SENDING TO TELEGRAM ---
    # (If you want WhatsApp, use the WhatsApp code block I gave earlier)
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

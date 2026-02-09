import os
import requests
import yfinance as yf
import pytz
from datetime import datetime

# --- CONFIGURATION ---
# FIXED: We use the *NAME* of the variable. GitHub fills in the value automatically.
BOT_TOKEN = os.environ["BOT_TOKEN"]
CHAT_ID = os.environ["CHAT_ID"]

# YOUR STOCK LIST
# Format: "Name": ["Option 1", "Option 2"]
STOCKS = {
    # --- INDIAN STOCKS ---
    "Swiggy": ["SWIGGY.NS", "SWIGGY.BO"],
    "Zomato (Eternal)": ["ETERNAL.NS", "ETERNAL.BO"],
    "Tata Motors": ["TATAMOTORS.BO", "TATAMOTORS.NS"],
    "SBI Bank": ["SBIN.NS", "SBIN.BO"],
    "Hero MotoCorp": ["HEROMOTOCO.NS", "HEROMOTOCO.BO"],
    "Nykaa": ["NYKAA.NS", "NYKAA.BO"],
    "TCS": ["TCS.NS", "TCS.BO"],
    "Groww ETF": ["GROWW.NS", "GROWW.BO"],

    # --- COMMODITIES (ETFs in INR) ---
    "Gold (BeES)": ["GOLDBEES.NS", "GOLDBEES.BO"],     # Tracks Gold price in INR
    "Silver (BeES)": ["SILVERBEES.NS", "SILVERBEES.BO"], # Tracks Silver price in INR

    # --- CRYPTO (Live 24/7 in INR) ---
    "Bitcoin": ["BTC-INR"],
    "Ethereum": ["ETH-INR"],
    "Solana": ["SOL-INR"],
    "Polygon (Matic)": ["MATIC-INR"]
}

def send_update():
    ist = pytz.timezone('Asia/Kolkata')
    time_now = datetime.now(ist).strftime('%I:%M %p')
    
    # Fixed typo: Added opening parenthesis '(' before time_now
    msg = f"🚀 *Market Update* ({time_now})\n"
    msg += "----------------------------\n"

    for name, ticker in STOCKS.items():
        try:
            stock = yf.Ticker(ticker)
            price = stock.fast_info.last_price
            
            if price:
                msg += f"• *{name}*: ₹{round(price, 2)}\n"
            else:
                msg += f"• *{name}*: N/A\n"
        except Exception as e:
            print(f"Skipping {name}: {e}")
            msg += f"• *{name}*: ⚠️ Not Found\n"

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

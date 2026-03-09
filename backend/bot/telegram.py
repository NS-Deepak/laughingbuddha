from fastapi import APIRouter, Request, BackgroundTasks
import os
import requests
from backend.database import db

router = APIRouter()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

async def send_message(chat_id: str, text: str):
    if not TELEGRAM_BOT_TOKEN:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})

@router.post("/api/telegram") # The path Next.js rewrites to
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
        
        if "message" in data:
            chat_id = str(data["message"]["chat"]["id"])
            text = data["message"].get("text", "")
            
            if text.strip() == "/start":
                msg = f"Welcome to Laughing Buddha! 🕉️\n\nYour Chat ID is: `{chat_id}`\n\nPaste this in your dashboard to link your account."
                background_tasks.add_task(send_message, chat_id, msg)
        
        return {"ok": True}
    except Exception as e:
        print(f"Telegram processing error: {e}")
        return {"ok": False}

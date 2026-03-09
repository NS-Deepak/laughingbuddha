from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
import os
import httpx
import hmac
import hashlib

router = APIRouter()

# Meta WhatsApp Cloud API credentials
WHATSAPP_TOKEN = os.environ.get("WHATSAPP_TOKEN")  # Your access token
WHATSAPP_PHONE_NUMBER_ID = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")  # Your phone number ID
WHATSAPP_VERIFY_TOKEN = os.environ.get("WHATSAPP_VERIFY_TOKEN", "laughing_buddha_verify")  # Webhook verification token
WHATSAPP_APP_SECRET = os.environ.get("WHATSAPP_APP_SECRET")  # For signature verification

async def send_whatsapp_message(to_number: str, message: str):
    """Send WhatsApp message via Meta Cloud API"""
    try:
        if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
            print("WARNING: WhatsApp Cloud API credentials not set")
            return False
        
        # Remove any whatsapp: prefix if present
        to_number = to_number.replace("whatsapp:", "").replace("+", "").strip()
        
        url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {
                "body": message
            }
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload)
            
            if resp.status_code == 200:
                print(f"WhatsApp message sent to {to_number}")
                return True
            else:
                print(f"Failed to send WhatsApp: {resp.status_code} - {resp.text}")
                return False
                
    except Exception as e:
        print(f"Failed to send WhatsApp message: {e}")
        return False

def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify webhook signature from Meta"""
    if not WHATSAPP_APP_SECRET:
        print("WARNING: WHATSAPP_APP_SECRET not set, skipping signature verification")
        return True
    
    try:
        expected_signature = hmac.new(
            WHATSAPP_APP_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # Remove 'sha256=' prefix if present
        signature = signature.replace("sha256=", "")
        
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False

@router.get("/api/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    """Verify webhook endpoint (Meta requires this for setup)"""
    params = request.query_params
    
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        print("Webhook verified successfully")
        return PlainTextResponse(content=challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/api/whatsapp")
async def whatsapp_webhook(request: Request):
    """Handle incoming WhatsApp messages from Meta Cloud API"""
    try:
        # Verify signature (optional but recommended)
        signature = request.headers.get("X-Hub-Signature-256", "")
        body = await request.body()
        
        if signature and not verify_webhook_signature(body, signature):
            raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Parse webhook payload
        data = await request.json()
        
        # Meta sends different event types, we only care about messages
        if data.get("object") != "whatsapp_business_account":
            return JSONResponse(content={"status": "ignored"})
        
        # Extract message data
        for entry in data.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                # Check if it's a message event
                messages = value.get("messages", [])
                if not messages:
                    continue
                
                for message in messages:
                    from_number = message.get("from")
                    message_type = message.get("type")
                    
                    # Only handle text messages
                    if message_type != "text":
                        continue
                    
                    text_body = message.get("text", {}).get("body", "").strip()
                    
                    print(f"WhatsApp message from {from_number}: {text_body}")
                    
                    # Handle commands
                    response_text = None
                    
                    if text_body.lower() in ["start", "/start"]:
                        response_text = f"Welcome to Laughing Buddha! 🕉️\n\nYour WhatsApp number is: +{from_number}\n\nPaste this in your dashboard to link your account."
                    
                    elif text_body.lower() == "help":
                        response_text = "📱 *Laughing Buddha Bot*\n\nCommands:\n- START: Link your account\n- HELP: Show this message\n\nYou'll receive market alerts here once you set them up in the dashboard."
                    
                    else:
                        response_text = "Thanks for your message! Use 'START' to link your account or 'HELP' for commands."
                    
                    # Send response
                    if response_text:
                        await send_whatsapp_message(from_number, response_text)
        
        # Always return 200 to Meta
        return JSONResponse(content={"status": "ok"})
        
    except Exception as e:
        print(f"WhatsApp webhook error: {e}")
        # Still return 200 to prevent Meta from retrying
        return JSONResponse(content={"status": "error", "message": str(e)})

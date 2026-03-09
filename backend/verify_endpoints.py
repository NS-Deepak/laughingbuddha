import requests
import json

def verify():
    print("--- Testing Search ---")
    try:
        resp = requests.get("http://localhost:8000/api/python/search?q=RELIANCE.NS")
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text[:200]}...")
    except Exception as e:
        print(f"Search Failed: {e}")

    print("\n--- Testing Telegram Webhook ---")
    try:
        payload = {"message": {"chat": {"id": 123456789}, "text": "/start"}}
        resp = requests.post("http://localhost:8000/api/telegram", json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")
    except Exception as e:
        print(f"Telegram Failed: {e}")

if __name__ == "__main__":
    verify()

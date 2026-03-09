import requests
import json
import time

BASE_URL = "http://localhost:8000"

def verify():
    print("⏳ Waiting for server...")
    time.sleep(2)

    print("\n--- 1. Health Check ---")
    try:
        resp = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.json()}")
    except Exception as e:
        print(f"Health Failed: {e}")

    print("\n--- 2. Search Asset ---")
    try:
        resp = requests.get(f"{BASE_URL}/api/search?q=TATA")
        print(f"Status: {resp.status_code}")
        # Print first 2 results
        data = resp.json()
        print(f"Results: {len(data)}")
        if data:
            print(f"Sample: {data[0]}")
    except Exception as e:
        print(f"Search Failed: {e}")

    print("\n--- 3. Sync User ---")
    user_id = "test_user_123"
    try:
        resp = requests.post(f"{BASE_URL}/api/users", json={
            "clerk_id": user_id,
            "email": "test@example.com"
        })
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.json()}")
    except Exception as e:
        print(f"User Sync Failed: {e}")

    print("\n--- 4. Create Alert ---")
    try:
        resp = requests.post(f"{BASE_URL}/api/alerts", json={
            "user_id": user_id,
            "asset_symbol": "TATASTEEL.NS",
            "asset_name": "Tata Steel Ltd",
            "asset_type": "STOCK",
            "trigger_type": "PRICE_LIMIT",
            "trigger_value": "150.00"
        })
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.json()}")
    except Exception as e:
        print(f"Create Alert Failed: {e}")

    print("\n--- 5. Get Alerts ---")
    try:
        resp = requests.get(f"{BASE_URL}/api/alerts/{user_id}")
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Count: {len(data)}")
    except Exception as e:
        print(f"Get Alerts Failed: {e}")

if __name__ == "__main__":
    verify()

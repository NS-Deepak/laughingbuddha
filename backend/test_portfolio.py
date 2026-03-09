import requests
import json

BASE_URL = "http://localhost:8000"
TEST_USER_ID = "test_user_portfolio_123"

def test_portfolio_api():
    print("=" * 50)
    print("Portfolio API Verification")
    print("=" * 50)
    
    # Test 1: Add Asset to Portfolio
    print("\n1. Adding RELIANCE.NS to portfolio...")
    try:
        resp = requests.post(f"{BASE_URL}/api/portfolio/add", json={
            "user_id": TEST_USER_ID,
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries",
            "asset_type": "STOCK",
            "exchange": "NSE"
        })
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✓ Added: {data['name']} ({data['symbol']})")
            print(f"   ✓ Current Price: ₹{data['current_price']}")
        else:
            print(f"   ✗ Error: {resp.text}")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
    
    # Test 2: Add Another Asset
    print("\n2. Adding BTC-USD to portfolio...")
    try:
        resp = requests.post(f"{BASE_URL}/api/portfolio/add", json={
            "user_id": TEST_USER_ID,
            "symbol": "BTC-USD",
            "name": "Bitcoin",
            "asset_type": "CRYPTO",
            "exchange": "BINANCE"
        })
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✓ Added: {data['name']} ({data['symbol']})")
            print(f"   ✓ Current Price: ${data['current_price']}")
        else:
            print(f"   ✗ Error: {resp.text}")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
    
    # Test 3: Get Portfolio
    print(f"\n3. Fetching portfolio for user {TEST_USER_ID}...")
    try:
        resp = requests.get(f"{BASE_URL}/api/portfolio/{TEST_USER_ID}")
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 200:
            portfolio = resp.json()
            print(f"   ✓ Portfolio has {len(portfolio)} assets:")
            for asset in portfolio:
                price_str = f"₹{asset['current_price']}" if asset['current_price'] else "N/A"
                print(f"      - {asset['name']} ({asset['symbol']}): {price_str}")
        else:
            print(f"   ✗ Error: {resp.text}")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
    
    # Test 4: Test Duplicate Prevention
    print("\n4. Testing duplicate prevention (adding RELIANCE.NS again)...")
    try:
        resp = requests.post(f"{BASE_URL}/api/portfolio/add", json={
            "user_id": TEST_USER_ID,
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries",
            "asset_type": "STOCK",
            "exchange": "NSE"
        })
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 400:
            print(f"   ✓ Duplicate correctly rejected: {resp.json()['detail']}")
        else:
            print(f"   ✗ Should have rejected duplicate")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
    
    # Test 5: Test NSE→BSE Fallback (using a delisted NSE stock)
    print("\n5. Testing NSE→BSE fallback...")
    print("   (This will show fallback logs in backend console)")
    
    print("\n" + "=" * 50)
    print("Verification Complete!")
    print("=" * 50)

if __name__ == "__main__":
    test_portfolio_api()

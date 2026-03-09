import requests
import sys

print("Testing Backend Connection...")
print("=" * 50)

try:
    # Test health endpoint
    print("\n1. Testing Health Endpoint...")
    response = requests.get("http://127.0.0.1:8000/api/python/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Health check failed: {e}")
    print("\n🚨 PYTHON BACKEND IS NOT RUNNING!")
    print("   Please start it with: python -m uvicorn backend.main:app --reload --port 8000")
    sys.exit(1)

try:
    # Test search endpoint
    print("\n2. Testing Search Endpoint...")
    response = requests.get("http://127.0.0.1:8000/api/python/search?q=swiggy", timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Results: {len(data)} items")
        if data:
            print(f"   First result: {data[0]}")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   ❌ Search failed: {e}")

print("\n" + "=" * 50)
print("✅ Backend is running and accessible!")

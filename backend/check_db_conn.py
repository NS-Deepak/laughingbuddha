import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_conn():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("❌ DATABASE_URL not set")
        return
    
    print(f"🔗 Attempting to connect to: {url.split('@')[-1]}") # Print host only for security
    try:
        conn = psycopg2.connect(url)
        print("✅ Connection successful!")
        cur = conn.cursor()
        cur.execute("SELECT version();")
        print(f"📊 Server version: {cur.fetchone()}")
        
        print("🛠️ Checking if 'asset_name' column exists...")
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='alerts' AND column_name='asset_name';")
        if cur.fetchone():
            print("✅ Column 'asset_name' EXISTS.")
        else:
            print("❌ Column 'asset_name' MISSING. Attempting to add...")
            cur.execute("ALTER TABLE alerts ADD COLUMN asset_name TEXT;")
            conn.commit()
            print("✅ Column 'asset_name' added successfully.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_conn()

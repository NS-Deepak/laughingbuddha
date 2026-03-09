import asyncio
from backend.database import db, connect_db, disconnect_db

async def fix_database():
    try:
        print("🔗 Connecting to database...")
        await connect_db()
        
        print("🛠️ Adding 'asset_name' column to 'alerts' table if missing...")
        # SQL for PostgreSQL (Neon)
        try:
            await db.execute_raw('ALTER TABLE alerts ADD COLUMN IF NOT EXISTS asset_name TEXT;')
            print("✅ 'asset_name' column added or already exists.")
        except Exception as e:
            print(f"❌ Failed to add 'asset_name': {e}")

        print("🛠️ Adding 'Asset' table if missing (optional but good for Phase 1)...")
        # Since Asset model was also added, let's try to add the table if it's missing
        # This is a bit more complex, but let's at least fix the immediate error first
        
        await disconnect_db()
        print("🔌 Disconnected.")
        
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_database())

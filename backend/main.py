from fastapi import FastAPI, HTTPException, Body
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

# Import your modules
from backend.database import connect_db, disconnect_db, db
from backend.scheduler import start_scheduler
from backend.schemas import UserCreate, AlertCreate, AlertResponse, AssetAdd, AssetResponse, TickerItem
from backend.bot.telegram import router as telegram_router
from backend.bot.whatsapp import router as whatsapp_router

# Define Lifecycle (Startup & Shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔌 Starting System...")
    await connect_db()     # 1. Connect DB
    start_scheduler()      # 2. Start Alert Engine
    yield
    print("🛑 Shutting Down...")
    await disconnect_db()  # 3. Disconnect DB

app = FastAPI(lifespan=lifespan)

# Allow Frontend to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telegram_router)
app.include_router(whatsapp_router)

# --- 1. HEALTH CHECK ---
@app.get("/api/python/health") # Keep existing path for compatibility
def health():
    return {"status": "ok", "service": "Laughing Buddha Backend 🧘"}

@app.get("/api/health") # Add user's path too
def health_alias():
    return {"status": "ok", "service": "Laughing Buddha Backend 🧘"}


# --- 2. USER MANAGEMENT ---
@app.post("/api/users")
async def sync_user(user: UserCreate):
    """Called by Clerk Webhook or Frontend when user signs up"""
    try:
        if not db.is_connected():
            await db.connect()
            
        # Upsert: Create if not exists, otherwise do nothing
        # CORRECTED: Use 'id' instead of 'clerkId' because schema uses 'id' for Clerk ID
        existing = await db.user.find_unique(where={"id": user.clerk_id})
        if not existing:
            await db.user.create(data={
                "id": user.clerk_id, # Use Clerk ID as PK
                "email": user.email
            })
        return {"status": "synced"}
    except Exception as e:
        print(f"Sync user error: {e}")
        # Don't break if sync fails, might be duplicate or connection issue
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. ALERT MANAGEMENT (CRUD) ---
@app.post("/api/python/alerts", response_model=AlertResponse)
async def create_alert(alert: AlertCreate):
    """Frontend sends alert data here to save to DB"""
    try:
        # 1. Ensure user exists
        # CORRECTED: Use 'id'
        user = await db.user.find_unique(where={"id": alert.user_id})
        if not user:
            # Auto-sync if missing? Or raise error?
            # Let's try to sync if logical, but for now raise error as per user code
            raise HTTPException(status_code=404, detail="User not found. Sync user first.")

        # 2. Save Alert
        # Schema now has asset_name
        new_alert = await db.alert.create(data={
            "userId": alert.user_id,
            "assetSymbol": alert.asset_symbol,
            "assetName": alert.asset_name,
            "assetType": alert.asset_type,   # Enum maps automatically
            "triggerType": alert.trigger_type,
            "triggerValue": alert.trigger_value
        })
        
        # Convert to Pydantic model response
        return AlertResponse(
            user_id=new_alert.userId,
            asset_symbol=new_alert.assetSymbol,
            asset_name=new_alert.assetName or "",
            asset_type=new_alert.assetType,
            trigger_type=new_alert.triggerType,
            trigger_value=new_alert.triggerValue,
            id=new_alert.id,
            is_active=new_alert.isActive,
            last_sent_at=str(new_alert.lastSentAt) if new_alert.lastSentAt else None
        )
            
    except Exception as e:
        print(f"Error creating alert: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save alert: {e}")

@app.get("/api/python/alerts/{user_id}")
async def get_user_alerts(user_id: str):
    """Fetch all alerts for a dashboard"""
    try:
        alerts = await db.alert.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"}
        )
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return []

@app.get("/api/python/alerts")
async def get_user_alerts_query(user_id: str):
    """Fetch all alerts using query param (called by frontend)"""
    try:
        alerts = await db.alert.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"}
        )
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return []

@app.delete("/api/python/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    """Delete an alert"""
    try:
        await db.alert.delete(where={"id": alert_id})
        return {"status": "success"}
    except Exception as e:
        print(f"Error deleting alert: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {e}")

# --- 4. PORTFOLIO MANAGEMENT ---
@app.post("/api/python/portfolio/add", response_model=AssetResponse)
async def add_asset_to_portfolio(asset: AssetAdd):
    """Add an asset to user's portfolio"""
    try:
        # Auto-create user if doesn't exist (prevents foreign key errors)
        user = await db.user.find_unique(where={"id": asset.user_id})
        if not user:
            print(f"🔄 Auto-creating user {asset.user_id}")
            await db.user.create(data={
                "id": asset.user_id,
                "email": f"{asset.user_id}@clerk.auto"  # Placeholder email
            })
        
        # Check if asset already exists
        existing = await db.asset.find_first(
            where={
                "userId": asset.user_id,
                "symbol": asset.symbol
            }
        )
        
        if existing:
            raise HTTPException(status_code=400, detail="Asset already in portfolio")
        
        # Create new asset
        new_asset = await db.asset.create(data={
            "userId": asset.user_id,
            "symbol": asset.symbol,
            "name": asset.name,
            "assetType": asset.asset_type,
            "exchange": asset.exchange
        })
        
        # Fetch current price
        current_price = await fetch_current_price(asset.symbol)
        
        return AssetResponse(
            id=new_asset.id,
            symbol=new_asset.symbol,
            name=new_asset.name,
            asset_type=new_asset.assetType,
            exchange=new_asset.exchange,
            added_at=str(new_asset.addedAt),
            current_price=current_price
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding asset: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add asset: {e}")

@app.get("/api/python/portfolio/{user_id}")
async def get_user_portfolio(user_id: str):
    """Get all assets in user's portfolio with live prices (parallelized)"""
    try:
        assets = await db.asset.find_many(
            where={"userId": user_id},
            order={"addedAt": "desc"}
        )
        
        # Parallelize price lookups
        async def fetch_asset_data(asset):
            try:
                import yfinance as yf
                ticker = yf.Ticker(asset.symbol)
                
                # Get current price
                current_price = await fetch_current_price(asset.symbol)
                
                # Calculate 24h change
                price_change_24h = None
                try:
                    # Get last 2 days of data to calculate 24h change
                    hist = ticker.history(period="2d")
                    if len(hist) >= 2:
                        prev_close = hist['Close'].iloc[-2]
                        if current_price and prev_close:
                            price_change_24h = round(((current_price - prev_close) / prev_close) * 100, 2)
                except Exception as e:
                    print(f"Could not calculate 24h change for {asset.symbol}: {e}")
                
                return AssetResponse(
                    id=asset.id,
                    symbol=asset.symbol,
                    name=asset.name,
                    asset_type=asset.assetType,
                    exchange=asset.exchange,
                    added_at=str(asset.addedAt),
                    current_price=current_price,
                    price_change_24h=price_change_24h
                )
            except Exception as e:
                print(f"Error fetching {asset.symbol}: {e}")
                return None

        # Build tasks
        tasks = [fetch_asset_data(a) for a in assets]
        results = await asyncio.gather(*tasks)
        
        # Filter out failed ones and return
        return [r for r in results if r is not None]
        
    except Exception as e:
        print(f"Error fetching portfolio: {e}")
        return []

@app.delete("/api/python/portfolio/{asset_id}")
async def remove_asset_from_portfolio(asset_id: str):
    """Remove an asset from portfolio"""
    try:
        await db.asset.delete(where={"id": asset_id})
        return {"status": "deleted", "id": asset_id}
    except Exception as e:
        print(f"Error deleting asset: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete asset")

# --- 5. ASSET SEARCH (Yahoo) ---
@app.get("/api/python/ticker", response_model=List[TickerItem])
async def get_market_ticker():
    """Fetch live ticker data for major indices and assets"""
    symbols = {
        "^NSEI": "NIFTY 50",
        "BTC-USD": "BTC-USD",
        "GC=F": "GOLD",
        "RELIANCE.NS": "RELIANCE",
        "TCS.NS": "TCS"
    }
    
    results = []
    import yfinance as yf
    
    try:
        # Fetching multiple results at once is faster
        tickers = yf.Tickers(" ".join(symbols.keys()))
        
        for symbol, display_name in symbols.items():
            try:
                t = tickers.tickers[symbol]
                info = t.fast_info
                
                price = round(info.last_price, 2) if info.last_price else 0.0
                
                # Get 24h change (close price from yesterday)
                # yf.Ticker.history(period="2d") gives current and previous day
                hist = t.history(period="2d")
                change_pct = 0.0
                if len(hist) >= 2:
                    prev_close = hist['Close'].iloc[-2]
                    change_pct = round(((price - prev_close) / prev_close) * 100, 2)
                
                results.append(TickerItem(
                    symbol=display_name,
                    name=display_name,
                    price=price,
                    change_pct=change_pct,
                    is_up=change_pct >= 0
                ))
            except Exception as e:
                print(f"Error fetching ticker for {symbol}: {e}")
                continue
                
        return results
    except Exception as e:
        print(f"Global ticker error: {e}")
        return []

@app.get("/api/python/search")
async def search_assets_endpoint(q: str):
    """Search endpoint with detailed error logging"""
    try:
        print(f"🔎 Received search request for: '{q}'")
        result = await search_assets(q)
        print(f"✅ Returning {len(result)} results")
        return result
    except Exception as e:
        print(f"💥 CRITICAL ERROR in search endpoint: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

async def search_assets(q: str):
    """Fast Auto-complete for Stocks/Crypto"""
    if not q:
        return []
    
    url = f"https://query2.finance.yahoo.com/v1/finance/search?q={q}&quotesCount=10"
    headers = {'User-Agent': 'Mozilla/5.0'}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            data = resp.json()
            
            print(f"🔍 Search query: '{q}' - Yahoo returned {len(data.get('quotes', []))} results")
            
            if not data.get('quotes'):
                print(f"⚠️ No quotes found for '{q}'. Raw response keys: {list(data.keys())}")
                return []
    except Exception as e:
        print(f"❌ Search error for query '{q}': {e}")
        raise  # Re-raise to see the full error

    results = []
    if 'quotes' in data:
        for item in data['quotes']:
            if 'symbol' not in item: 
                continue
            
            # Determine Type & Category
            q_type = "STOCK"
            quote_type = item.get('quoteType', '')
            symbol = item.get('symbol', '')
            
            if quote_type == 'CRYPTOCURRENCY':
                q_type = "CRYPTO"
            elif quote_type in ['FUTURE', 'COMMODITY'] or symbol in ['GC=F', 'SI=F', 'HG=F']:
                q_type = "COMMODITY"
            elif quote_type == 'INDEX' or symbol.startswith('^'):
                q_type = "INDEX"

            results.append({
                "symbol": symbol,
                "name": item.get('shortname') or item.get('longname') or symbol,
                "type": q_type,
                "exchange": item.get('exchange', 'Unknown'),
                "price": None # Prices fetched only on selection or separately
            })
    
    print(f"✅ Returning {len(results)} results for '{q}'")
    return results

async def fetch_current_price(symbol: str):
    """Fetch current price for a symbol using yfinance with NSE→BSE fallback"""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        # Use fast_info for quick price lookup
        price = ticker.fast_info.last_price
        
        if price and price > 0:
            return round(price, 2)
        
        # If price is None or 0, trigger fallback
        raise ValueError("Invalid price")
        
    except Exception as e:
        # Smart Fallback: If NSE fails, try BSE
        if symbol.endswith('.NS'):
            bse_symbol = symbol.replace('.NS', '.BO')
            print(f"NSE failed for {symbol}, trying BSE: {bse_symbol}")
            try:
                import yfinance as yf
                ticker = yf.Ticker(bse_symbol)
                price = ticker.fast_info.last_price
                return round(price, 2) if price else None
            except Exception as bse_error:
                print(f"BSE also failed for {bse_symbol}: {bse_error}")
                return None
        
        print(f"Error fetching price for {symbol}: {e}")
        return None


if __name__ == "__main__":
    import uvicorn
    # Run on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)

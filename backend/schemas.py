from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

# These match your Prisma Enums
class AssetType(str, Enum):
    STOCK = "STOCK"
    CRYPTO = "CRYPTO"
    COMMODITY = "COMMODITY"

class TriggerType(str, Enum):
    SCHEDULED = "SCHEDULED"
    PRICE_LIMIT = "PRICE_LIMIT"

# --- REQUEST MODELS (What Frontend sends) ---

class UserCreate(BaseModel):
    clerk_id: str
    email: str

class AlertCreate(BaseModel):
    user_id: str
    asset_symbol: str   # e.g. "RELIANCE.NS"
    asset_name: str     # e.g. "Reliance Industries"
    asset_type: AssetType
    trigger_type: TriggerType
    trigger_value: str  # "09:00" or "300.00"

# --- RESPONSE MODELS (What Backend returns) ---

class AlertResponse(AlertCreate):
    id: str
    is_active: bool
    last_sent_at: Optional[str] = None

# --- PORTFOLIO MODELS ---

class AssetAdd(BaseModel):
    user_id: str
    symbol: str          # e.g. "RELIANCE.NS"
    name: str            # e.g. "Reliance Industries"
    asset_type: AssetType
    exchange: str        # e.g. "NSE"

class AssetResponse(BaseModel):
    id: str
    symbol: str
    name: str
    asset_type: AssetType
    exchange: str
    added_at: str
    current_price: Optional[float] = None
    price_change_24h: Optional[float] = None

class TickerItem(BaseModel):
    symbol: str
    name: str
    price: float
    change_pct: float
    is_up: bool

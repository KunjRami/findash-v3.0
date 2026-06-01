from pydantic import BaseModel, Field
from typing import List, Optional


class Stock(BaseModel):
    symbol: str
    name: str
    exchange: str = "NSE"

    sector: Optional[str] = None
    industry: Optional[str] = None

    market_cap_category: Optional[str] = None

    indices: List[str] = []

    is_active: bool = True
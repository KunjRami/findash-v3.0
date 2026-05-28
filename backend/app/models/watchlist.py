from pydantic import BaseModel
from typing import Optional


class WatchlistItemCreate(BaseModel):
    symbol: str
    company_name: str
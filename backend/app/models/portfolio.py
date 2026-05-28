from pydantic import BaseModel, Field
from typing import Optional


class PortfolioItemCreate(BaseModel):
    symbol: str
    company_name: str
    quantity: float = Field(..., gt=0)
    buy_price: float = Field(..., gt=0)
    buy_date: Optional[str] = None


class PortfolioItemUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0)
    buy_price: Optional[float] = Field(None, gt=0)
from fastapi import APIRouter, Depends, Query
from app.services.stock_service import (
    get_market_indices,
    get_top_movers,
    search_stocks,
    get_stock_detail,
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/market-overview")
async def market_overview(_: dict = Depends(get_current_user)):
    return await get_market_indices()


@router.get("/top-movers")
async def top_movers(_: dict = Depends(get_current_user)):
    return await get_top_movers()


@router.get("/search")
async def search(
    q: str = Query(..., min_length=1),
    _: dict = Depends(get_current_user),
):
    return await search_stocks(q)


@router.get("/{symbol}")
async def stock_detail(
    symbol: str,
    period: str = Query("3mo", pattern="^(1mo|3mo|6mo|1y|2y|5y)$"),
    _: dict = Depends(get_current_user),
):
    return await get_stock_detail(symbol, period)
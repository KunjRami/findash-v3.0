from fastapi import APIRouter, Depends, HTTPException
from app.models.watchlist import WatchlistItemCreate
from app.routes.auth import get_current_user
from app.database import get_database
from app.services.stock_service import get_current_price
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("/")
async def get_watchlist(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    items = await db.watchlist.find({"user_id": user_id}).to_list(200)

    result = []
    for item in items:
        price = await get_current_price(item["symbol"])
        result.append(
            {
                "id": str(item["_id"]),
                "symbol": item["symbol"],
                "company_name": item["company_name"],
                "current_price": round(price, 2) if price else None,
                "created_at": item["created_at"].isoformat(),
            }
        )
    return result


@router.post("/", status_code=201)
async def add_to_watchlist(
    item: WatchlistItemCreate, current_user: dict = Depends(get_current_user)
):
    db = get_database()
    user_id = str(current_user["_id"])

    if await db.watchlist.find_one({"user_id": user_id, "symbol": item.symbol.upper()}):
        raise HTTPException(status_code=400, detail="Stock already in watchlist")

    result = await db.watchlist.insert_one(
        {
            "user_id": user_id,
            "symbol": item.symbol.upper(),
            "company_name": item.company_name,
            "created_at": datetime.utcnow(),
        }
    )
    return {"id": str(result.inserted_id), "message": "Added to watchlist"}


@router.delete("/{item_id}")
async def remove_from_watchlist(
    item_id: str, current_user: dict = Depends(get_current_user)
):
    db = get_database()
    result = await db.watchlist.delete_one(
        {"_id": ObjectId(item_id), "user_id": str(current_user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Removed from watchlist"}
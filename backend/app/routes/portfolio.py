from fastapi import APIRouter, Depends, HTTPException
from app.models.portfolio import PortfolioItemCreate, PortfolioItemUpdate
from app.routes.auth import get_current_user
from app.database import get_database
from app.services.stock_service import get_current_price
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/")
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    items_cursor = db.portfolio.find({"user_id": user_id})
    items = await items_cursor.to_list(200)

    result = []
    total_invested = 0.0
    total_current = 0.0

    for item in items:
        price = await get_current_price(item["symbol"])
        invested = item["quantity"] * item["buy_price"]
        current_val = item["quantity"] * (price or item["buy_price"])
        pnl = current_val - invested
        pnl_pct = (pnl / invested * 100) if invested > 0 else 0.0

        total_invested += invested
        total_current += current_val

        result.append(
            {
                "id": str(item["_id"]),
                "symbol": item["symbol"],
                "company_name": item["company_name"],
                "quantity": item["quantity"],
                "buy_price": round(item["buy_price"], 2),
                "buy_date": item.get("buy_date"),
                "current_price": round(price, 2) if price else None,
                "invested_value": round(invested, 2),
                "current_value": round(current_val, 2),
                "pnl": round(pnl, 2),
                "pnl_percent": round(pnl_pct, 2),
                "created_at": item["created_at"].isoformat(),
            }
        )

    total_pnl = total_current - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100) if total_invested > 0 else 0.0

    return {
        "items": result,
        "summary": {
            "total_invested": round(total_invested, 2),
            "total_current_value": round(total_current, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_percent": round(total_pnl_pct, 2),
            "item_count": len(result),
        },
    }


@router.post("/", status_code=201)
async def add_to_portfolio(
    item: PortfolioItemCreate, current_user: dict = Depends(get_current_user)
):
    db = get_database()
    doc = {
        "user_id": str(current_user["_id"]),
        "symbol": item.symbol.upper(),
        "company_name": item.company_name,
        "quantity": item.quantity,
        "buy_price": item.buy_price,
        "buy_date": item.buy_date,
        "created_at": datetime.utcnow(),
    }
    result = await db.portfolio.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Added to portfolio"}


@router.put("/{item_id}")
async def update_portfolio_item(
    item_id: str,
    update: PortfolioItemUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    existing = await db.portfolio.find_one(
        {"_id": ObjectId(item_id), "user_id": str(current_user["_id"])}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.portfolio.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    return {"message": "Updated successfully"}


@router.delete("/{item_id}")
async def remove_from_portfolio(
    item_id: str, current_user: dict = Depends(get_current_user)
):
    db = get_database()
    result = await db.portfolio.delete_one(
        {"_id": ObjectId(item_id), "user_id": str(current_user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Removed from portfolio"}
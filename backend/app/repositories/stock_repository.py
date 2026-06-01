from app.database import get_database


class StockRepository:

    @staticmethod
    async def insert_many(stocks: list):
        db = get_database()
        return await db.stocks.insert_many(stocks)

    @staticmethod
    async def search(query: str, limit: int = 10):
        db = get_database()

        cursor = db.stocks.find(
            {
                "$or": [
                    {
                        "symbol": {
                            "$regex": query,
                            "$options": "i"
                        }
                    },
                    {
                        "name": {
                            "$regex": query,
                            "$options": "i"
                        }
                    }
                ]
            },
            {"_id": 0}
        ).limit(limit)

        return await cursor.to_list(length=limit)

    @staticmethod
    async def get_by_index(index_name: str):
        db = get_database()

        cursor = db.stocks.find(
            {
                "indices": index_name
            },
            {"_id": 0}
        )

        return await cursor.to_list(None)

    @staticmethod
    async def get_by_market_cap(category: str):
        db = get_database()

        cursor = db.stocks.find(
            {
                "market_cap_category": category
            },
            {"_id": 0}
        )

        return await cursor.to_list(None)
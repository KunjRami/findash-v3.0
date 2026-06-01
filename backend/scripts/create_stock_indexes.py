import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://127.0.0.1:50561/?directConnection=true"


async def main():

    client = AsyncIOMotorClient(MONGO_URL)

    db = client["findash"]

    await db.stocks.create_index(
        "symbol",
        unique=True
    )

    await db.stocks.create_index(
        "name"
    )

    await db.stocks.create_index(
        "market_cap_category"
    )

    await db.stocks.create_index(
        "indices"
    )

    print("Stock indexes created")

    client.close()


asyncio.run(main())
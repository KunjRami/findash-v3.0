import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

stocks = [
    {
        "symbol": "TCS.NS",
        "name": "Tata Consultancy Services",
        "exchange": "NSE",
        "sector": "IT",
        "market_cap_category": "large_cap",
        "indices": [
            "NIFTY_50",
            "NIFTY_100",
            "NIFTY_500"
        ]
    },
    {
        "symbol": "RELIANCE.NS",
        "name": "Reliance Industries",
        "exchange": "NSE",
        "sector": "Energy",
        "market_cap_category": "large_cap",
        "indices": [
            "NIFTY_50",
            "NIFTY_100",
            "NIFTY_500"
        ]
    },
    {
        "symbol": "IRCTC.NS",
        "name": "IRCTC",
        "exchange": "NSE",
        "sector": "Railways",
        "market_cap_category": "mid_cap",
        "indices": [
            "NIFTY_500"
        ]
    }
]


async def main():

    client = AsyncIOMotorClient(
        "mongodb://127.0.0.1:50561/?directConnection=true"
    )

    db = client["findash"]

    await db.stocks.delete_many({})

    await db.stocks.insert_many(stocks)

    print("Stocks imported")

    client.close()


asyncio.run(main())
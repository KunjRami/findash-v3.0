from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_db():
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print("✅ Connected to MongoDB Compass")


async def close_db():
    if db.client:
        db.client.close()
        print("🔌 Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    return db.client[settings.DATABASE_NAME]
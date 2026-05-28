from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import connect_db, close_db
from app.routes import auth, stocks, portfolio, watchlist


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Findash API",
    description="🚀 Fintech Dashboard REST API powered by FastAPI & MongoDB",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Vite dev server and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(stocks.router, prefix=PREFIX)
app.include_router(portfolio.router, prefix=PREFIX)
app.include_router(watchlist.router, prefix=PREFIX)


@app.get("/")
async def root():
    return {"message": "Findash API is running ✅", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
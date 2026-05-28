import yfinance as yf
import pandas as pd
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any, Optional
from app.services.technical_analysis import prepare_technical_data

executor = ThreadPoolExecutor(max_workers=10)

# ─── Stock Universe ────────────────────────────────────────────────────────────
NIFTY_50_STOCKS = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank"},
    {"symbol": "INFY.NS", "name": "Infosys"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever"},
    {"symbol": "ITC.NS", "name": "ITC Limited"},
    {"symbol": "SBIN.NS", "name": "State Bank of India"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro"},
    {"symbol": "WIPRO.NS", "name": "Wipro"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki"},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical"},
    {"symbol": "TITAN.NS", "name": "Titan Company"},
    {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance"},
    {"symbol": "NESTLEIND.NS", "name": "Nestle India"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corporation"},
    {"symbol": "NTPC.NS", "name": "NTPC Limited"},
    {"symbol": "ONGC.NS", "name": "Oil & Natural Gas Corp"},
    {"symbol": "JSWSTEEL.NS", "name": "JSW Steel"},
]

SYMBOL_NAME_MAP = {s["symbol"]: s["name"] for s in NIFTY_50_STOCKS}


# ─── Sync helpers (run in thread pool) ────────────────────────────────────────
def _fetch_index(symbol: str, name: str) -> Dict:
    try:
        hist = yf.Ticker(symbol).history(period="5d")
        if hist.empty:
            return {"symbol": symbol, "name": name, "error": "No data"}
        current = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current
        change = current - prev
        pct = (change / prev) * 100 if prev else 0
        return {
            "symbol": symbol,
            "name": name,
            "price": round(current, 2),
            "change": round(change, 2),
            "change_percent": round(pct, 2),
            "open": round(float(hist["Open"].iloc[-1]), 2),
            "high": round(float(hist["High"].iloc[-1]), 2),
            "low": round(float(hist["Low"].iloc[-1]), 2),
            "volume": int(hist["Volume"].iloc[-1]),
        }
    except Exception as e:
        return {"symbol": symbol, "name": name, "error": str(e)}


def _fetch_top_movers() -> Dict:
    gainers, losers = [], []
    symbols = [s["symbol"] for s in NIFTY_50_STOCKS[:20]]
    try:
        raw = yf.download(symbols, period="5d", progress=False, auto_adjust=True)
        close = raw["Close"] if "Close" in raw.columns else raw.xs("Close", axis=1, level=0)
        for sym in symbols:
            try:
                col = close[sym].dropna()
                if len(col) < 2:
                    continue
                cur = float(col.iloc[-1])
                prev = float(col.iloc[-2])
                chg = cur - prev
                pct = (chg / prev) * 100 if prev else 0
                item = {
                    "symbol": sym.replace(".NS", ""),
                    "full_symbol": sym,
                    "name": SYMBOL_NAME_MAP.get(sym, sym),
                    "price": round(cur, 2),
                    "change": round(chg, 2),
                    "change_percent": round(pct, 2),
                }
                (gainers if pct > 0 else losers).append(item)
            except Exception:
                continue
    except Exception as e:
        print(f"top_movers error: {e}")
    gainers.sort(key=lambda x: x["change_percent"], reverse=True)
    losers.sort(key=lambda x: x["change_percent"])
    return {"gainers": gainers[:5], "losers": losers[:5]}


def _search_stocks(query: str) -> List[Dict]:
    q = query.lower().strip()
    results = [
        {"symbol": s["symbol"], "name": s["name"], "exchange": "NSE"}
        for s in NIFTY_50_STOCKS
        if q in s["symbol"].lower() or q in s["name"].lower()
    ]
    if not results:
        sym = f"{query.upper()}.NS"
        try:
            info = yf.Ticker(sym).info
            if info.get("regularMarketPrice") or info.get("currentPrice"):
                results.append({
                    "symbol": sym,
                    "name": info.get("longName", query.upper()),
                    "exchange": "NSE",
                })
        except Exception:
            pass
    return results[:10]


def _fetch_stock_detail(symbol: str, period: str) -> Dict:
    if "." not in symbol:
        symbol = f"{symbol.upper()}.NS"
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period=period)
        if hist.empty:
            return {"error": "No data available for this symbol"}

        cur = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else cur
        chg = cur - prev
        pct = (chg / prev) * 100 if prev else 0

        technical = prepare_technical_data(hist)

        return {
            "symbol": symbol,
            "name": info.get("longName", symbol),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "pb_ratio": info.get("priceToBook"),
            "dividend_yield": info.get("dividendYield"),
            "week_52_high": info.get("fiftyTwoWeekHigh"),
            "week_52_low": info.get("fiftyTwoWeekLow"),
            "current_price": round(cur, 2),
            "previous_close": round(prev, 2),
            "change": round(chg, 2),
            "change_percent": round(pct, 2),
            "volume": int(hist["Volume"].iloc[-1]),
            "avg_volume": info.get("averageVolume"),
            "technical_data": technical,
        }
    except Exception as e:
        return {"error": str(e)}


def _fetch_current_price(symbol: str) -> Optional[float]:
    try:
        hist = yf.Ticker(symbol).history(period="2d")
        return float(hist["Close"].iloc[-1]) if not hist.empty else None
    except Exception:
        return None


# ─── Async public API ──────────────────────────────────────────────────────────
async def get_market_indices() -> Dict:
    loop = asyncio.get_event_loop()
    # nifty, sensex, bank_nifty = await asyncio.gather(
    #     loop.run_in_executor(executor, _fetch_index, "^NSEI", "NIFTY 50"),
    #     loop.run_in_executor(executor, _fetch_index, "^BSESN", "SENSEX"),
    #     loop.run_in_executor(executor, _fetch_index, "^NSEBANK", "BANK NIFTY"),
    # )
    # return {"nifty": nifty, "sensex": sensex, "bank_nifty": bank_nifty}
    stock1, stock2, stock3 = await asyncio.gather(
        loop.run_in_executor(executor, _fetch_index, "RELIANCE.NS", "Reliance"),
        loop.run_in_executor(executor, _fetch_index, "TCS.NS", "TCS"),
        loop.run_in_executor(executor, _fetch_index, "HDFCBANK.NS", "HDFC Bank"),
    )
    return {
        "stock1": stock1,
        "stock2": stock2,
        "stock3": stock3,
    }

async def get_top_movers() -> Dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _fetch_top_movers)


async def search_stocks(query: str) -> List[Dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _search_stocks, query)


async def get_stock_detail(symbol: str, period: str = "3mo") -> Dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _fetch_stock_detail, symbol, period)


async def get_current_price(symbol: str) -> Optional[float]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _fetch_current_price, symbol)
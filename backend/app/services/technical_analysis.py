import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional


def calculate_sma(prices: pd.Series, period: int) -> pd.Series:
    """Simple Moving Average"""
    return prices.rolling(window=period).mean()


def calculate_ema(prices: pd.Series, period: int) -> pd.Series:
    """Exponential Moving Average"""
    return prices.ewm(span=period, adjust=False).mean()


def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index"""
    delta = prices.diff()
    gain = delta.where(delta > 0, 0.0).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0.0)).rolling(window=period).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def calculate_macd(
    prices: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> Dict[str, pd.Series]:
    """MACD: Moving Average Convergence/Divergence"""
    ema_fast = calculate_ema(prices, fast)
    ema_slow = calculate_ema(prices, slow)
    macd_line = ema_fast - ema_slow
    signal_line = calculate_ema(macd_line, signal)
    histogram = macd_line - signal_line
    return {"macd": macd_line, "signal": signal_line, "histogram": histogram}


def calculate_bollinger_bands(
    prices: pd.Series, period: int = 20, std_dev: int = 2
) -> Dict[str, pd.Series]:
    """Bollinger Bands"""
    sma = calculate_sma(prices, period)
    std = prices.rolling(window=period).std()
    return {
        "upper": sma + (std * std_dev),
        "middle": sma,
        "lower": sma - (std * std_dev),
    }


def _to_list(s: pd.Series) -> List[Optional[float]]:
    """Convert series to JSON-serializable list, replacing NaN with None"""
    return [None if (v is None or (isinstance(v, float) and np.isnan(v))) else round(float(v), 4) for v in s]


def prepare_technical_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Prepare all technical indicator data from OHLCV dataframe"""
    close = df["Close"]

    # Moving averages
    sma_20 = calculate_sma(close, 20)
    sma_50 = calculate_sma(close, 50)
    ema_9 = calculate_ema(close, 9)
    ema_21 = calculate_ema(close, 21)

    # Momentum
    rsi = calculate_rsi(close, 14)
    macd_data = calculate_macd(close)

    # Volatility
    bb = calculate_bollinger_bands(close)

    dates = df.index.strftime("%Y-%m-%d").tolist()

    return {
        "dates": dates,
        "ohlcv": {
            "open": _to_list(df["Open"]),
            "high": _to_list(df["High"]),
            "low": _to_list(df["Low"]),
            "close": _to_list(close),
            "volume": [None if pd.isna(v) else int(v) for v in df["Volume"]],
        },
        "indicators": {
            "sma_20": _to_list(sma_20),
            "sma_50": _to_list(sma_50),
            "ema_9": _to_list(ema_9),
            "ema_21": _to_list(ema_21),
            "rsi": _to_list(rsi),
            "macd": _to_list(macd_data["macd"]),
            "macd_signal": _to_list(macd_data["signal"]),
            "macd_histogram": _to_list(macd_data["histogram"]),
            "bb_upper": _to_list(bb["upper"]),
            "bb_middle": _to_list(bb["middle"]),
            "bb_lower": _to_list(bb["lower"]),
        },
    }
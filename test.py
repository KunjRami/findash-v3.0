import yfinance as yf

ticker = yf.Ticker("TCS.NS")

print(ticker.history(period="1d"))

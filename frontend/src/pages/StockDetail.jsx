import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, TrendingDown, Plus, BookmarkPlus,
  BookmarkCheck, RefreshCw, BarChart2, Activity, LineChart,
} from "lucide-react";
import { stocksAPI } from "../services/api";
import useWatchlistStore from "../store/watchlistStore";
import usePortfolioStore from "../store/portfolioStore";
import PriceChart from "../components/charts/PriceChart";
import CandlestickChart from "../components/charts/CandlestickChart";
import RSIChart from "../components/charts/RSIChart";
import MACDChart from "../components/charts/MACDChart";
import { ChartSkeleton, PageLoader } from "../components/ui/LoadingSkeleton";
import { formatCurrency, formatNumber, formatVolume, formatMarketCap, cleanSymbol } from "../utils/formatters";

/* ── Period selector ─────────────────────────────────────────── */
const PERIODS = ["1mo", "3mo", "6mo", "1y", "2y"];

/* ── Fundamental stat cell ───────────────────────────────────── */
const Stat = ({ label, value }) => (
  <div className="bg-fin-muted/30 rounded-xl p-3">
    <p className="text-xs text-fin-text-secondary mb-1">{label}</p>
    <p className="font-num font-semibold text-fin-text-primary text-sm">{value ?? "—"}</p>
  </div>
);

/* ── Add to Portfolio mini-form ──────────────────────────────── */
function AddPortfolioForm({ stock, onClose }) {
  const addItem = usePortfolioStore((s) => s.addItem);
  const [qty, setQty]     = useState("");
  const [price, setPrice] = useState(stock?.current_price?.toString() || "");
  const [date, setDate]   = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr]     = useState("");

  const handleAdd = async () => {
    if (!qty || !price) { setErr("Quantity and price are required."); return; }
    setSaving(true);
    const result = await addItem({
      symbol: stock.symbol,
      company_name: stock.name,
      quantity: parseFloat(qty),
      buy_price: parseFloat(price),
      buy_date: date || undefined,
    });
    setSaving(false);
    if (result.success) onClose();
    else setErr(result.error || "Failed to add.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="fin-card p-5 space-y-4 border border-fin-blue/20"
    >
      <h4 className="text-sm font-bold text-fin-text-primary">
        Add {cleanSymbol(stock?.symbol)} to Portfolio
      </h4>
      {err && <p className="text-xs text-fin-red">{err}</p>}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-fin-text-secondary">Quantity</label>
          <input
            type="number" value={qty} onChange={(e) => setQty(e.target.value)}
            placeholder="10" className="fin-input w-full text-sm h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-fin-text-secondary">Buy Price (₹)</label>
          <input
            type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            className="fin-input w-full text-sm h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-fin-text-secondary">Date</label>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="fin-input w-full text-sm h-9"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="fin-btn-ghost flex-1 text-sm h-9">Cancel</button>
        <button onClick={handleAdd} disabled={saving} className="fin-btn-primary flex-1 text-sm h-9">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Add"}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function StockDetail() {
  const { symbol } = useParams();
  const navigate   = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [period, setPeriod]   = useState("3mo");
  const [chartMode, setChartMode] = useState("area");   // "area" | "candle"
  const [activeTab, setActiveTab] = useState("price");  // "price" | "rsi" | "macd"
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);

  const { items: wlItems, addItem: wlAdd, removeItem: wlRemove } = useWatchlistStore();
  const inWatchlist = wlItems.some(
    (i) => cleanSymbol(i.symbol).toUpperCase() === symbol?.toUpperCase()
  );

  /* fetch stock data */
  const fetchData = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await stocksAPI.detail(symbol, period);
      if (res.error) throw new Error(res.error);
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* watchlist toggle */
  const toggleWatchlist = async () => {
    if (!data) return;
    if (inWatchlist) {
      const item = wlItems.find(
        (i) => cleanSymbol(i.symbol).toUpperCase() === symbol?.toUpperCase()
      );
      if (item) await wlRemove(item.id);
    } else {
      await wlAdd(data.symbol, data.name);
    }
  };

  const isUp = (data?.change_percent ?? 0) >= 0;

  /* ── Loading ── */
  if (loading && !data) {
    return (
      <div className="space-y-6 pb-8">
        <PageLoader label="Loading stock data…" />
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="space-y-4 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-fin-text-secondary hover:text-fin-text-primary text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="fin-card p-8 text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-fin-text-primary font-semibold">Could not load stock</p>
          <p className="text-fin-text-secondary text-sm">{error}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate(-1)} className="fin-btn-ghost">← Back</button>
            <button onClick={fetchData}           className="fin-btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── Back nav ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-fin-text-secondary hover:text-fin-text-primary text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* ── Stock header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fin-card p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: name + price */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fin-blue/10 flex items-center justify-center">
                <span className="text-fin-blue font-bold text-sm font-mono">
                  {cleanSymbol(data.symbol).slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold font-display text-fin-text-primary leading-tight">
                  {data.name}
                </h1>
                <p className="text-xs text-fin-text-secondary">
                  <span className="font-mono font-semibold text-fin-blue">
                    {cleanSymbol(data.symbol)}
                  </span>
                  {data.sector && data.sector !== "N/A" && (
                    <> · {data.sector}</>
                  )}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-bold font-num text-fin-text-primary">
                {formatCurrency(data.current_price)}
              </span>
              <div className={`flex items-center gap-1.5 ${isUp ? "text-fin-green" : "text-fin-red"}`}>
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-num font-bold text-base">
                  {isUp ? "+" : ""}{formatNumber(data.change, 2)}
                </span>
                <span
                  className={`text-sm font-num font-bold px-1.5 py-0.5 rounded
                    ${isUp ? "bg-emerald-950 text-fin-green" : "bg-red-950 text-fin-red"}`}
                >
                  {isUp ? "+" : ""}{data.change_percent?.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-fin-text-secondary">
              Prev close: {formatCurrency(data.previous_close)}
            </p>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleWatchlist}
              className={`flex items-center gap-2 text-sm h-9 px-4 rounded-lg font-semibold border transition-all
                ${inWatchlist
                  ? "bg-fin-blue/10 border-fin-blue text-fin-blue"
                  : "border-fin-border text-fin-text-secondary hover:border-fin-blue hover:text-fin-blue"}`}
            >
              {inWatchlist ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
              {inWatchlist ? "Watching" : "Watchlist"}
            </button>
            <button
              onClick={() => setShowAddPortfolio((p) => !p)}
              className="fin-btn-primary flex items-center gap-2 text-sm h-9 px-4"
            >
              <Plus size={15} /> Add to Portfolio
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg border border-fin-border text-fin-text-secondary
                hover:bg-fin-muted transition-all disabled:opacity-40"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Quick fundamentals row */}
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-4 pt-4 border-t border-fin-border">
          {[
            { label: "Mkt Cap",    value: formatMarketCap(data.market_cap) },
            { label: "P/E",        value: data.pe_ratio?.toFixed(2) },
            { label: "P/B",        value: data.pb_ratio?.toFixed(2) },
            { label: "52W High",   value: formatCurrency(data.week_52_high) },
            { label: "52W Low",    value: formatCurrency(data.week_52_low) },
            { label: "Volume",     value: formatVolume(data.volume) },
            { label: "Div Yield",  value: data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="text-xs">
              <span className="text-fin-text-secondary">{label}: </span>
              <span className="font-num font-semibold text-fin-text-primary">{value ?? "—"}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add to portfolio inline form */}
      <AnimatePresence>
        {showAddPortfolio && data && (
          <AddPortfolioForm
            stock={data}
            onClose={() => setShowAddPortfolio(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Chart panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fin-card p-5 space-y-4"
      >
        {/* Chart controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Period tabs */}
          <div className="flex gap-1 bg-fin-muted/40 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                  ${period === p
                    ? "bg-fin-blue text-white shadow"
                    : "text-fin-text-secondary hover:text-fin-text-primary"}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart mode + indicator tabs */}
          <div className="flex gap-1 bg-fin-muted/40 rounded-lg p-1">
            {[
              { key: "price",  icon: LineChart,  label: "Price"  },
              { key: "candle", icon: BarChart2,  label: "OHLC"   },
              { key: "rsi",    icon: Activity,   label: "RSI"    },
              { key: "macd",   icon: Activity,   label: "MACD"   },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all
                  ${activeTab === key
                    ? "bg-fin-surface text-fin-text-primary shadow"
                    : "text-fin-text-secondary hover:text-fin-text-primary"}`}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart area */}
        {loading ? (
          <ChartSkeleton height={320} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${period}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "price" && (
                <PriceChart technicalData={data?.technical_data} height={320} />
              )}
              {activeTab === "candle" && (
                <CandlestickChart technicalData={data?.technical_data} height={320} />
              )}
              {activeTab === "rsi" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-fin-text-secondary uppercase">RSI (14)</span>
                    <span className="text-xs text-fin-text-secondary">· Overbought &gt;70 · Oversold &lt;30</span>
                  </div>
                  <RSIChart technicalData={data?.technical_data} height={240} />
                </div>
              )}
              {activeTab === "macd" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-fin-text-secondary uppercase">MACD (12,26,9)</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> MACD</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> Signal</span>
                    </div>
                  </div>
                  <MACDChart technicalData={data?.technical_data} height={240} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Fundamentals grid ── */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fin-card p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-fin-text-primary">Fundamentals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <Stat label="Market Cap"        value={formatMarketCap(data.market_cap)}       />
            <Stat label="P/E Ratio"         value={data.pe_ratio?.toFixed(2)}              />
            <Stat label="P/B Ratio"         value={data.pb_ratio?.toFixed(2)}              />
            <Stat label="Div. Yield"        value={data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : "—"} />
            <Stat label="52W High"          value={formatCurrency(data.week_52_high)}      />
            <Stat label="52W Low"           value={formatCurrency(data.week_52_low)}       />
            <Stat label="Volume"            value={formatVolume(data.volume)}              />
            <Stat label="Avg Volume"        value={formatVolume(data.avg_volume)}          />
            <Stat label="Sector"            value={data.sector}                            />
            <Stat label="Industry"          value={data.industry}                          />
            <Stat label="Prev. Close"       value={formatCurrency(data.previous_close)}    />
            <Stat label="Current Price"     value={formatCurrency(data.current_price)}     />
          </div>
        </motion.div>
      )}
    </div>
  );
}
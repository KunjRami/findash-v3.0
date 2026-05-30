import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { stocksAPI } from "../../services/api";
import StockCard from "./StockCard";
import { MoverCardSkeleton } from "../ui/LoadingSkeleton";

export default function TopMovers() {
  const [tab, setTab] = useState("gainers");
  const [data, setData] = useState({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await stocksAPI.topMovers();
      setData(res);
    } catch {
      setError("Could not load movers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const list = data[tab] || [];

  return (
    <div className="fin-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-fin-border">
        <h3 className="text-sm font-bold text-fin-text-primary">Top Movers</h3>
        <button
          onClick={fetch}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-fin-muted text-fin-text-secondary transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {[
          { key: "gainers", label: "Gainers", icon: TrendingUp,  color: "text-fin-green" },
          { key: "losers",  label: "Losers",  icon: TrendingDown, color: "text-fin-red"   },
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${tab === key
                ? key === "gainers"
                  ? "bg-emerald-950 text-fin-green"
                  : "bg-red-950 text-fin-red"
                : "text-fin-text-secondary hover:bg-fin-muted"
              }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 px-2 py-2">
        {error ? (
          <p className="text-xs text-fin-text-secondary text-center py-6">{error}</p>
        ) : loading ? (
          Array.from({ length: 5 }).map((_, i) => <MoverCardSkeleton key={i} />)
        ) : list.length === 0 ? (
          <p className="text-xs text-fin-text-secondary text-center py-6">No data available</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "gainers" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {list.map((stock, i) => (
                <StockCard key={stock.symbol} stock={stock} rank={i + 1} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
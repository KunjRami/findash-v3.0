import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { stocksAPI } from "@/services/api";
import { formatNumber, formatChange, changeClass } from "@/utils/formatters";
import { Skeleton } from "@/components/ui";

function IndexCard({ data, delay = 0 }) {
  if (!data) return <Skeleton className="h-28" />;
  const isUp = data.change_percent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`fin-card p-5 border ${
        isUp ? "border-fin-green/20" : "border-fin-red/20"
      } hover:shadow-lg transition-all cursor-pointer group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-fin-text-secondary uppercase tracking-wider">
            {data.name}
          </p>
          <p className="text-2xl font-bold font-num text-fin-text-primary mt-1">
            {formatNumber(data.price, 2)}
          </p>
        </div>
        <div
          className={`p-2 rounded-lg ${
            isUp ? "bg-fin-green/10 text-fin-green" : "bg-fin-red/10 text-fin-red"
          }`}
        >
          {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        </div>
      </div>
      <div className={`flex items-center gap-2 mt-3 ${changeClass(data.change_percent)}`}>
        <span className="text-sm font-num font-semibold">
          {isUp ? "+" : ""}
          {formatNumber(data.change, 2)}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-num font-semibold ${
            isUp ? "bg-fin-green/10" : "bg-fin-red/10"
          }`}
        >
          {formatChange(data.change_percent)}
        </span>
      </div>
      <div className="flex gap-4 mt-3 text-xs text-fin-text-secondary font-num">
        <span>H: {formatNumber(data.high, 2)}</span>
        <span>L: {formatNumber(data.low, 2)}</span>
        <span>O: {formatNumber(data.open, 2)}</span>
      </div>
    </motion.div>
  );
}

export default function MarketOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await stocksAPI.marketOverview();
      setData(res);
      setLastUpdated(new Date());
    } catch (e) {
      setError("Failed to load market data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-fin-text-primary font-display">
          Market Overview
        </h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-fin-text-secondary">
              Updated {lastUpdated.toLocaleTimeString("en-IN")}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-fin-muted text-fin-text-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="fin-card p-4 text-center text-fin-red text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : (
            <>
              <IndexCard data={data?.nifty} delay={0} />
              <IndexCard data={data?.sensex} delay={0.05} />
              <IndexCard data={data?.bank_nifty} delay={0.1} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
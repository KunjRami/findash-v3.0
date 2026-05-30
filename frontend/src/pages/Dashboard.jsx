import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Briefcase, BookmarkCheck } from "lucide-react";
import useAuthStore from "../store/authStore";
import usePortfolioStore from "../store/portfolioStore";
import useWatchlistStore from "../store/watchlistStore";
import MarketOverview from "../components/stocks/MarketOverview";
import TopMovers from "../components/stocks/TopMovers";
import { formatCurrency, cleanSymbol } from "../utils/formatters";

/* ── Fade-up animation wrapper ─────────────────────────────────── */
const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    {children}
  </motion.div>
);

/* ── Quick portfolio summary card ──────────────────────────────── */
function PortfolioWidget() {
  const { items, summary, loading, fetchPortfolio } = usePortfolioStore();
  const navigate = useNavigate();

  useEffect(() => { fetchPortfolio(); }, []);

  const isUp = (summary?.total_pnl ?? 0) >= 0;

  return (
    <div className="fin-card flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-fin-border">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-fin-blue" />
          <h3 className="text-sm font-bold text-fin-text-primary">Portfolio</h3>
        </div>
        <button
          onClick={() => navigate("/portfolio")}
          className="text-xs text-fin-blue hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={11} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-fin-border border-t-fin-blue rounded-full animate-spin" />
          </div>
        ) : !summary || items.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-fin-text-secondary text-xs">No holdings yet</p>
            <button
              onClick={() => navigate("/portfolio")}
              className="fin-btn-primary text-xs h-7 px-3"
            >
              Add Holdings
            </button>
          </div>
        ) : (
          <>
            {/* Summary numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-fin-muted/40 rounded-lg p-3">
                <p className="text-xs text-fin-text-secondary mb-1">Invested</p>
                <p className="font-num font-bold text-fin-text-primary text-sm">
                  {formatCurrency(summary.total_invested)}
                </p>
              </div>
              <div className="bg-fin-muted/40 rounded-lg p-3">
                <p className="text-xs text-fin-text-secondary mb-1">Current</p>
                <p className="font-num font-bold text-fin-text-primary text-sm">
                  {formatCurrency(summary.total_current_value)}
                </p>
              </div>
            </div>

            {/* P&L */}
            <div className={`rounded-lg p-3 ${isUp ? "bg-emerald-950/50" : "bg-red-950/50"}`}>
              <p className="text-xs text-fin-text-secondary mb-1">Total P&L</p>
              <div className="flex items-baseline gap-2">
                <p className={`font-num font-bold text-base ${isUp ? "text-fin-green" : "text-fin-red"}`}>
                  {isUp ? "+" : ""}{formatCurrency(summary.total_pnl)}
                </p>
                <span className={`text-xs font-num font-semibold ${isUp ? "text-fin-green" : "text-fin-red"}`}>
                  ({isUp ? "+" : ""}{summary.total_pnl_percent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Top 3 holdings */}
            <div className="space-y-1">
              {items.slice(0, 3).map((h) => {
                const up = (h.pnl ?? 0) >= 0;
                return (
                  <div key={h.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-mono font-semibold text-fin-blue">
                      {cleanSymbol(h.symbol)}
                    </span>
                    <span className={`font-num font-semibold ${up ? "text-fin-green" : "text-fin-red"}`}>
                      {up ? "+" : ""}{h.pnl_percent.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
              {items.length > 3 && (
                <p className="text-xs text-fin-text-secondary text-center pt-1">
                  +{items.length - 3} more
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Watchlist preview widget ──────────────────────────────────── */
function WatchlistWidget() {
  const { items, loading, fetchWatchlist } = useWatchlistStore();
  const navigate = useNavigate();

  useEffect(() => { fetchWatchlist(); }, []);

  return (
    <div className="fin-card flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-fin-border">
        <div className="flex items-center gap-2">
          <BookmarkCheck size={14} className="text-fin-purple" />
          <h3 className="text-sm font-bold text-fin-text-primary">Watchlist</h3>
        </div>
        <button
          onClick={() => navigate("/watchlist")}
          className="text-xs text-fin-blue hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={11} />
        </button>
      </div>

      <div className="px-2 py-2 flex-1">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-fin-border border-t-fin-blue rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-fin-text-secondary text-xs">Watchlist is empty</p>
            <button
              onClick={() => navigate("/watchlist")}
              className="fin-btn-primary text-xs h-7 px-3"
            >
              Add Stocks
            </button>
          </div>
        ) : (
          items.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/stocks/${cleanSymbol(item.symbol)}`)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                hover:bg-fin-muted transition-colors text-left"
            >
              <div>
                <p className="font-mono font-bold text-sm text-fin-blue">{cleanSymbol(item.symbol)}</p>
                <p className="text-xs text-fin-text-secondary truncate max-w-[120px]">
                  {item.company_name}
                </p>
              </div>
              <p className="font-num font-semibold text-sm text-fin-text-primary">
                {item.current_price ? formatCurrency(item.current_price) : "—"}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <FadeUp>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-fin-text-primary">
              {greeting}, {user?.full_name?.split(" ")[0] || user?.username} 👋
            </h1>
            <p className="text-fin-text-secondary text-sm mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-fin-muted/40 border border-fin-border rounded-xl px-3 py-2">
            <div className="w-2 h-2 bg-fin-green rounded-full animate-pulse" />
            <span className="text-xs text-fin-text-secondary font-medium">Markets Live</span>
          </div>
        </div>
      </FadeUp>

      {/* Market overview */}
      <FadeUp delay={0.05}>
        <MarketOverview />
      </FadeUp>

      {/* Two-column: movers + (portfolio + watchlist) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top movers — wider col */}
        <FadeUp delay={0.1} >
          <div className="lg:col-span-1 h-full">
            <TopMovers />
          </div>
        </FadeUp>

        {/* Portfolio + watchlist stacked */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FadeUp delay={0.15}>
            <PortfolioWidget />
          </FadeUp>
          <FadeUp delay={0.2}>
            <WatchlistWidget />
          </FadeUp>
        </div>
      </div>

      {/* Quick nav cards */}
      <FadeUp delay={0.25}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "📈",
              title: "Markets",
              desc: "NIFTY 50 · SENSEX · Bank NIFTY",
              action: () => {},
              color: "border-fin-blue/20 hover:border-fin-blue/50",
            },
            {
              icon: "💼",
              title: "Portfolio",
              desc: "Track holdings & P&L",
              action: () => (window.location.href = "/portfolio"),
              color: "border-fin-green/20 hover:border-fin-green/40",
            },
            {
              icon: "🔖",
              title: "Watchlist",
              desc: "Monitor your favourites",
              action: () => (window.location.href = "/watchlist"),
              color: "border-fin-purple/20 hover:border-fin-purple/40",
            },
          ].map((c) => (
            <button
              key={c.title}
              onClick={c.action}
              className={`fin-card p-4 text-left border transition-all duration-200 hover:bg-fin-muted/30 ${c.color}`}
            >
              <div className="text-2xl mb-2">{c.icon}</div>
              <p className="font-bold text-fin-text-primary text-sm">{c.title}</p>
              <p className="text-xs text-fin-text-secondary mt-0.5">{c.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-fin-blue">
                Open <ArrowRight size={11} />
              </div>
            </button>
          ))}
        </div>
      </FadeUp>
    </div>
  );
}
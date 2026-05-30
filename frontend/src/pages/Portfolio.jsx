import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Briefcase, BarChart2, DollarSign, Percent,
} from "lucide-react";
import usePortfolioStore from "../store/portfolioStore";
import PortfolioTable from "../components/portfolio/PortfolioTable";
import { formatCurrency } from "../utils/formatters";
import { StatCardSkeleton } from "../components/ui/LoadingSkeleton";

/* ── KPI summary card ──────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, accent, delay }) {
  const styles = {
    blue:   { card: "border-fin-blue/20",   icon: "bg-fin-blue/10 text-fin-blue"   },
    green:  { card: "border-fin-green/20",  icon: "bg-emerald-950  text-fin-green"  },
    red:    { card: "border-fin-red/20",    icon: "bg-red-950       text-fin-red"    },
    purple: { card: "border-fin-purple/20", icon: "bg-violet-950   text-fin-purple" },
  };
  const s = styles[accent] || styles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`fin-card p-5 border ${s.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-fin-text-secondary uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold font-num text-fin-text-primary">{value}</p>
          {sub && <p className="text-xs font-num text-fin-text-secondary">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${s.icon}`}>
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Portfolio() {
  const { summary, loading, fetchPortfolio } = usePortfolioStore();

  useEffect(() => { fetchPortfolio(); }, []);

  const isUp = (summary?.total_pnl ?? 0) >= 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-fin-text-primary flex items-center gap-2">
            <Briefcase size={22} className="text-fin-blue" /> Portfolio
          </h1>
          <p className="text-fin-text-secondary text-sm mt-1">
            Track your holdings and realised P&amp;L
          </p>
        </div>
      </motion.div>

      {/* KPI row */}
      {loading && !summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Invested"
            value={formatCurrency(summary.total_invested)}
            icon={DollarSign}
            accent="blue"
            delay={0}
          />
          <KpiCard
            label="Current Value"
            value={formatCurrency(summary.total_current_value)}
            icon={BarChart2}
            accent="purple"
            delay={0.05}
          />
          <KpiCard
            label="Total P&L"
            value={`${isUp ? "+" : ""}${formatCurrency(summary.total_pnl)}`}
            sub={`${isUp ? "▲" : "▼"} ${Math.abs(summary.total_pnl_percent).toFixed(2)}% overall`}
            icon={isUp ? TrendingUp : TrendingDown}
            accent={isUp ? "green" : "red"}
            delay={0.1}
          />
          <KpiCard
            label="Holdings"
            value={summary.item_count}
            sub="active positions"
            icon={Percent}
            accent="blue"
            delay={0.15}
          />
        </div>
      ) : null}

      {/* Holdings table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PortfolioTable />
      </motion.div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatChange, cleanSymbol } from "../../utils/formatters";

export default function StockCard({ stock, rank }) {
  const navigate = useNavigate();
  const isUp = (stock.change_percent ?? 0) >= 0;
  const sym = cleanSymbol(stock.full_symbol || stock.symbol);

  return (
    <button
      onClick={() => navigate(`/stocks/${sym}`)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-fin-muted
                 transition-all duration-150 text-left group"
    >
      {/* Rank badge */}
      {rank !== undefined && (
        <span className="text-xs font-num font-bold text-fin-text-secondary w-4 shrink-0">
          {rank}
        </span>
      )}

      {/* Symbol avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
          ${isUp ? "bg-emerald-950 text-fin-green" : "bg-red-950 text-fin-red"}`}
      >
        {sym.slice(0, 2)}
      </div>

      {/* Name + symbol */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fin-text-primary truncate font-num">{sym}</p>
        <p className="text-xs text-fin-text-secondary truncate leading-tight">
          {stock.name}
        </p>
      </div>

      {/* Price + change */}
      <div className="text-right shrink-0">
        <p className="text-sm font-num font-semibold text-fin-text-primary">
          {stock.price ? `₹${stock.price.toLocaleString("en-IN")}` : "—"}
        </p>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-num font-bold
            ${isUp ? "text-fin-green" : "text-fin-red"}`}
        >
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {formatChange(stock.change_percent)}
        </span>
      </div>
    </button>
  );
}